const express = require('express');
const cors = require('cors');
const os = require('os');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const HOSTNAME = os.hostname();

// Middlewares
app.use(cors({
    exposedHeaders: ['X-Server-Port', 'X-Server-ID']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Simple Production Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}`);
    next();
});

// Global middleware to inject PORT and HOSTNAME in every response
app.use((req, res, next) => {
    res.setHeader('X-Server-Port', PORT);
    res.setHeader('X-Server-ID', HOSTNAME);
    next();
});

// AWS Health Check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Existing API Status
app.get('/api/status', (req, res) => {
  res.json({
    status: "OK",
    port: PORT,
    hostname: HOSTNAME
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Serve frontend
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/', (req, res) => res.redirect('/login'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Taskionix activo en puerto ${PORT} (0.0.0.0)`);
});
