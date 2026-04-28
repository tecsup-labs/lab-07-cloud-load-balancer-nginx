document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const username = user.email.split('@')[0];
    document.getElementById('userEmailLabel').textContent = username;

    const taskForm = document.getElementById('taskForm');
    const taskCardsContainer = document.getElementById('taskCardsContainer');
    const logoutBtn = document.getElementById('logoutBtn');
    const trashBin = document.getElementById('trashBin');
    const searchInput = document.getElementById('searchInput');

    // View state
    let currentView = 'dashboard';
    let allTasks = [];

    // Stats elements
    const statCompleted = document.getElementById('statCompleted');
    const statPending = document.getElementById('statPending');
    const statPercentage = document.getElementById('statPercentage');
    const statsPanel = document.getElementById('statsPanel');
    const pageHeader = document.getElementById('pageHeader');
    const taskListTitle = document.getElementById('taskListTitle');
    let statsChartInstance = null;

    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            currentView = item.getAttribute('data-view');
            renderDashboard();
        });
    });

    // --- Chart Logic ---
    const initOrUpdateChart = (completed, pending) => {
        const total = completed + pending;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        if (statCompleted) statCompleted.textContent = completed;
        if (statPending) statPending.textContent = pending;
        if (statPercentage) statPercentage.textContent = `${percentage}%`;

        const ctx = document.getElementById('statsChart');
        if (!ctx) return;

        const textColor = '#0f172a';

        if (statsChartInstance) {
            statsChartInstance.data.datasets[0].data = [completed, pending];
            statsChartInstance.options.plugins.legend.labels.color = textColor;
            statsChartInstance.update();
        } else {
            statsChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Completadas', 'Pendientes'],
                    datasets: [{
                        data: [completed, pending],
                        backgroundColor: ['#a855f7', '#06b6d4'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    cutout: '75%',
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return ` ${context.label}: ${context.raw}`;
                                }
                            }
                        }
                    }
                }
            });
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Read the server port and ID from headers
            const serverPort = res.headers.get('X-Server-Port');
            const serverID = res.headers.get('X-Server-ID');
            
            if (serverPort) document.getElementById('currentPortLabel').textContent = serverPort;
            if (serverID) document.getElementById('serverIDLabel').textContent = serverID;

            if (res.status === 401 || res.status === 403) {
                logout();
                return;
            }
            const tasks = await res.json();

            // Calculate stats
            const completedCount = tasks.filter(t => t.completed).length;
            const pendingCount = tasks.length - completedCount;
            initOrUpdateChart(completedCount, pendingCount);

            allTasks = tasks.reverse(); // Store newest first
            renderDashboard();
        } catch (err) {
            console.error('Error fetching tasks', err);
        }
    };

    const renderDashboard = () => {
        let displayTasks = [];

        if (currentView === 'dashboard') {
            displayTasks = allTasks.slice(0, 2); // Only 2 most recent
            statsPanel.style.display = 'block';
            pageHeader.style.display = 'block';
            taskListTitle.innerHTML = '<i class="bi bi-clock-history me-2"></i> Agregadas Recientemente';
        } else if (currentView === 'activas') {
            displayTasks = allTasks.filter(t => !t.completed);
            statsPanel.style.display = 'none';
            pageHeader.style.display = 'none';
            taskListTitle.innerHTML = '<i class="bi bi-circle me-2"></i> Tareas Activas';
        } else if (currentView === 'completadas') {
            displayTasks = allTasks.filter(t => t.completed);
            statsPanel.style.display = 'none';
            pageHeader.style.display = 'none';
            taskListTitle.innerHTML = '<i class="bi bi-check2-circle me-2"></i> Tareas Completadas';
        }

        if (displayTasks.length === 0) {
            let emptyMessage = 'No hay tareas para mostrar en esta vista.';
            if (currentView === 'activas') emptyMessage = '¡Felicidades! Has completado todo.';
            if (currentView === 'completadas') emptyMessage = 'Aún no has completado tus tareas.';

            taskCardsContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted opacity-50 mb-3 d-block"></i>
                    <h5 class="text-secondary fw-semibold">Todo limpio</h5>
                    <p class="text-muted small">${emptyMessage}</p>
                </div>
            `;
            return;
        }

        taskCardsContainer.innerHTML = displayTasks.map((task, index) => `
            <div class="task-item glass-panel" data-id="${task.id}" style="animation-delay: ${index * 0.05}s">
                <div class="task-content">
                    <div class="task-checkbox ${task.completed ? 'completed' : ''}" onclick="toggleTask(${task.id}, ${task.completed})" title="Marcar como ${task.completed ? 'pendiente' : 'completado'}">
                        <i class="bi ${task.completed ? 'bi-check-circle-fill text-purple' : 'bi-circle'}"></i>
                    </div>
                    <span class="task-title ${task.completed ? 'text-decoration-line-through text-muted' : ''}">${task.title}</span>
                </div>
                <div class="task-actions">
                    <button class="btn-icon edit-btn" onclick="openEditModal(${task.id}, '${task.title.replace(/'/g, "\\'")}')" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn-icon delete-btn" onclick="deleteTask(${task.id})" title="Eliminar">
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Trigger search filter again if there's text in the search box
        if (searchInput && searchInput.value) {
            searchInput.dispatchEvent(new Event('input'));
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const tasks = document.querySelectorAll('.task-item');
            tasks.forEach(task => {
                const title = task.querySelector('.task-title').textContent.toLowerCase();
                if (title.includes(term)) {
                    task.style.display = 'flex';
                } else {
                    task.style.display = 'none';
                }
            });
        });
    }

    window.openCreateModal = () => {
        const modal = new bootstrap.Modal(document.getElementById('createModal'));
        modal.show();
        // Focus input after modal is shown
        document.getElementById('createModal').addEventListener('shown.bs.modal', () => {
            document.getElementById('taskTitle').focus();
        }, { once: true });
    };

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('taskTitle');
        const title = titleInput.value;
        const submitBtn = taskForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>...';

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title })
            });
            if (res.ok) {
                titleInput.value = '';
                const modal = bootstrap.Modal.getInstance(document.getElementById('createModal'));
                if (modal) modal.hide();
                fetchTasks();
            }
        } catch (err) {
            console.error('Error creating task', err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });

    window.toggleTask = async (id, currentStatus) => {
        const taskEl = document.querySelector(`.task-item[data-id="${id}"]`);
        if (taskEl) taskEl.classList.add('updating');

        try {
            await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ completed: !currentStatus })
            });
            setTimeout(() => {
                fetchTasks();
            }, 300); // Allow animation to play a bit
        } catch (err) {
            console.error('Error toggling task', err);
            if (taskEl) taskEl.classList.remove('updating');
        }
    };

    window.deleteTask = async (id) => {
        const result = await Swal.fire({
            title: '¿Mandar al tacho?',
            text: "Esta tarea será eliminada permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f43f5e',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'premium-swal-popup',
                title: 'premium-swal-title fw-bold text-dark',
                htmlContainer: 'text-muted'
            }
        });

        if (!result.isConfirmed) return;

        const taskEl = document.querySelector(`.task-item[data-id="${id}"]`);

        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                if (taskEl) {
                    taskEl.classList.add('deleting');
                    trashBin.classList.add('show');

                    setTimeout(() => {
                        trashBin.classList.add('eating');
                    }, 300);

                    setTimeout(() => {
                        taskEl.remove();
                        trashBin.classList.remove('eating');
                        setTimeout(() => trashBin.classList.remove('show'), 300);

                        fetchTasks(); // refresh to update stats
                    }, 600);
                } else {
                    fetchTasks();
                }
            }
        } catch (err) {
            console.error('Error deleting task', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar la tarea',
                confirmButtonColor: '#a855f7'
            });
        }
    };

    window.openEditModal = (id, title) => {
        document.getElementById('editTaskId').value = id;
        document.getElementById('editTaskTitle').value = title;
        const modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();

        document.getElementById('editModal').addEventListener('shown.bs.modal', () => {
            document.getElementById('editTaskTitle').focus();
        }, { once: true });
    };

    document.getElementById('saveTaskBtn').addEventListener('click', async () => {
        const id = document.getElementById('editTaskId').value;
        const title = document.getElementById('editTaskTitle').value;
        const btn = document.getElementById('saveTaskBtn');
        const originalText = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>...';

        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title })
            });
            if (res.ok) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
                if (modal) modal.hide();
                fetchTasks();
            }
        } catch (err) {
            console.error('Error updating task', err);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    logoutBtn.addEventListener('click', logout);

    fetchTasks();
});
