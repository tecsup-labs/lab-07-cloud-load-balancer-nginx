// Inyectar estilos premium para SweetAlert2
const swalStyles = document.createElement('style');
swalStyles.innerHTML = `
    .premium-swal-popup {
        border-radius: 24px !important;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08) !important;
        font-family: 'Inter', sans-serif !important;
        padding: 2.5rem 2rem !important;
        border: 1px solid rgba(255,255,255,0.8) !important;
    }
    .premium-swal-title {
        font-weight: 800 !important;
        font-size: 1.5rem !important;
        color: #1f2937 !important;
        margin-bottom: 0.5rem !important;
    }
    .premium-swal-text {
        color: #6b7280 !important;
        font-size: 0.95rem !important;
        font-weight: 500 !important;
    }
    .premium-swal-btn-login {
        background: linear-gradient(135deg, #6366f1 0%, #f43f5e 100%) !important;
        color: #ffffff !important;
        border: none !important;
        border-radius: 8px !important;
        font-weight: 600 !important;
        font-size: 0.95rem !important;
        padding: 12px 32px !important;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4) !important;
        transition: transform 0.3s ease, box-shadow 0.3s ease !important;
        margin-top: 1rem !important;
    }
    .premium-swal-btn-login:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6) !important;
    }
    .premium-swal-btn-register {
        background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%) !important;
        color: #ffffff !important;
        border: none !important;
        border-radius: 8px !important;
        font-weight: 600 !important;
        font-size: 0.95rem !important;
        padding: 12px 32px !important;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4) !important;
        transition: transform 0.3s ease, box-shadow 0.3s ease !important;
        margin-top: 1rem !important;
    }
    .premium-swal-btn-register:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6) !important;
    }
    .premium-swal-backdrop {
        backdrop-filter: blur(8px) !important;
        background: rgba(255, 255, 255, 0.4) !important;
    }
    
    /* Personalizar colores de los íconos de Swal para que combinen con la temática */
    .swal2-icon.swal2-error {
        border-color: #f43f5e !important;
        color: #f43f5e !important;
    }
    .swal2-icon.swal2-error [class^=swal2-x-mark-line] {
        background-color: #f43f5e !important;
    }
    .swal2-icon.swal2-success {
        border-color: #10b981 !important;
        color: #10b981 !important;
    }
    .swal2-icon.swal2-success [class^=swal2-success-line] {
        background-color: #10b981 !important;
    }
    .swal2-icon.swal2-success .swal2-success-ring {
        border-color: rgba(16, 185, 129, 0.2) !important;
    }
`;
document.head.appendChild(swalStyles);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginBtn = loginForm.querySelector('.btn-submit');

            const originalText = loginBtn.innerHTML;
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verificando...';

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = '/dashboard';
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de acceso',
                        text: data.message || 'Credenciales incorrectas',
                        buttonsStyling: false,
                        customClass: {
                            popup: 'premium-swal-popup',
                            title: 'premium-swal-title',
                            htmlContainer: 'premium-swal-text',
                            confirmButton: 'premium-swal-btn-login',
                            backdrop: 'premium-swal-backdrop'
                        }
                    });
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de red',
                    text: 'No se pudo conectar con el servidor',
                    buttonsStyling: false,
                    customClass: {
                        popup: 'premium-swal-popup',
                        title: 'premium-swal-title',
                        htmlContainer: 'premium-swal-text',
                        confirmButton: 'premium-swal-btn-login',
                        backdrop: 'premium-swal-backdrop'
                    }
                });
            } finally {
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalText;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const registerBtn = registerForm.querySelector('.btn-submit');

            const originalText = registerBtn.innerHTML;
            registerBtn.disabled = true;
            registerBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creando cuenta...';

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Cuenta creada!',
                        text: 'Tu cuenta se registró correctamente.',
                        showConfirmButton: false,
                        timer: 2000,
                        customClass: {
                            popup: 'premium-swal-popup',
                            title: 'premium-swal-title',
                            htmlContainer: 'premium-swal-text',
                            backdrop: 'premium-swal-backdrop'
                        }
                    }).then(() => {
                        window.location.href = '/login';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'No se pudo registrar',
                        text: data.message || 'El usuario ya existe o hubo un problema',
                        buttonsStyling: false,
                        customClass: {
                            popup: 'premium-swal-popup',
                            title: 'premium-swal-title',
                            htmlContainer: 'premium-swal-text',
                            confirmButton: 'premium-swal-btn-register',
                            backdrop: 'premium-swal-backdrop'
                        }
                    });
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de red',
                    text: 'No se pudo conectar con el servidor',
                    buttonsStyling: false,
                    customClass: {
                        popup: 'premium-swal-popup',
                        title: 'premium-swal-title',
                        htmlContainer: 'premium-swal-text',
                        confirmButton: 'premium-swal-btn-register',
                        backdrop: 'premium-swal-backdrop'
                    }
                });
            } finally {
                registerBtn.disabled = false;
                registerBtn.innerHTML = originalText;
            }
        });
    }
});
