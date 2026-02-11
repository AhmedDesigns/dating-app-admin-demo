const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-123';

app.use(express.json());
app.use(cors());

// Database Setup (SQLite)
const db = new sqlite3.Database(':memory:'); // Use memory for demo, or 'database.sqlite' for persistence

db.serialize(() => {
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        resetToken TEXT,
        resetExpires DATETIME
    )`);

    // Seed Admin User
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT INTO users (email, password, role) VALUES ('admin@demo.com', '${hashedPassword}', 'admin')`);
});

// --- API ROUTES ---

// Login
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err || !user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { email: user.email, role: user.role } });
    });
});

// Forgot Password
app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (!user) {
            return res.json({ message: 'If email exists, code sent.' });
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 3600000).toISOString();
        
        db.run('UPDATE users SET resetToken = ?, resetExpires = ? WHERE id = ?', [code, expires, user.id], () => {
            res.json({ message: 'Reset code generated (Demo Mode)', code: code });
        });
    });
});

// Reset Password
app.post('/api/auth/reset-password', (req, res) => {
    const { email, code, newPassword } = req.body;
    db.get('SELECT * FROM users WHERE email = ? AND resetToken = ?', [email, code], (err, user) => {
        if (!user || new Date(user.resetExpires) < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        db.run('UPDATE users SET password = ?, resetToken = NULL, resetExpires = NULL WHERE id = ?', [hashedPassword, user.id], () => {
            res.json({ message: 'Password updated successfully' });
        });
    });
});

// Dummy Stats for Demo
app.get('/api/admin/stats/dashboard', (req, res) => {
    res.json({
        totalUsers: 1250,
        totalMatches: 4500,
        pendingReports: 12,
        activeNow: 85
    });
});

// Mock Users for Demo
app.get('/api/admin/users', (req, res) => {
    res.json({
        data: [
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', isBanned: false },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', isBanned: false }
        ],
        total: 2,
        page: 1,
        limit: 20
    });
});

// --- SERVE STATIC FILES ---
// Serve Admin Panel
app.use('/admin', express.static(path.join(__dirname, '../public')));

// Handle SPA routing for Admin
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Root redirect to Admin
app.get('/', (req, res) => {
    res.redirect('/admin');
});

app.listen(PORT, () => {
    console.log(`Demo server running on port ${PORT}`);
});
