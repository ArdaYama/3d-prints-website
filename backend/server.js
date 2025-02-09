const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());  // Allow all origins for now
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// File path for users data
const usersFilePath = path.join(__dirname, 'users.json');

// Helper functions
function readUsers() {
    try {
        const data = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(data).users;
    } catch (error) {
        return [];
    }
}

function writeUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify({ users }, null, 2));
}

function findUserByEmail(email) {
    const users = readUsers();
    return users.find(user => user.email === email);
}

function generateUserId() {
    return Date.now().toString();
}

// Routes
app.get('/', (req, res) => {
    res.json({ 
        status: 'success',
        message: 'Welcome to 3D Prints API',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        
        // Check if user exists
        const existingUser = findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const newUser = {
            id: generateUserId(),
            fullName,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        // Save user
        const users = readUsers();
        users.push(newUser);
        writeUsers(users);

        // Create token
        const token = jwt.sign(
            { id: newUser.id }, 
            process.env.JWT_SECRET || 'your-secret-key', 
            { expiresIn: '1h' }
        );

        res.status(201).json({
            status: 'success',
            token,
            data: { user: { fullName: newUser.fullName, email: newUser.email } }
        });
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(400).json({ 
            message: 'Kayıt işlemi sırasında bir hata oluştu',
            error: error.message 
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'E-posta veya şifre hatalı' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'E-posta veya şifre hatalı' });
        }

        // Create token
        const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET || 'your-secret-key', 
            { expiresIn: '1h' }
        );

        res.json({
            status: 'success',
            token,
            data: { user: { fullName: user.fullName, email: user.email } }
        });
    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(400).json({ 
            message: 'Giriş işlemi sırasında bir hata oluştu',
            error: error.message 
        });
    }
});

app.get('/api/auth/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Lütfen giriş yapın' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const users = readUsers();
        const user = users.find(u => u.id === decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        res.json({
            status: 'success',
            data: { user: { fullName: user.fullName, email: user.email } }
        });
    } catch (error) {
        console.error('Kimlik doğrulama hatası:', error);
        res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }
});

// Admin routes
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = readUsers();
        // Remove password field from response
        const safeUsers = users.map(({ password, ...user }) => user);
        res.json({ status: 'success', users: safeUsers });
    } catch (error) {
        console.error('Kullanıcılar listelenirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

app.delete('/api/admin/users/:userId', async (req, res) => {
    try {
        const users = readUsers();
        const updatedUsers = users.filter(user => user.id !== req.params.userId);
        writeUsers(updatedUsers);
        res.json({ status: 'success', message: 'Kullanıcı silindi' });
    } catch (error) {
        console.error('Kullanıcı silinirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

app.put('/api/admin/users/:userId', async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const users = readUsers();
        const userIndex = users.findIndex(user => user.id === req.params.userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        users[userIndex] = {
            ...users[userIndex],
            fullName,
            email
        };

        writeUsers(users);
        res.json({ 
            status: 'success', 
            message: 'Kullanıcı güncellendi',
            user: users[userIndex]
        });
    } catch (error) {
        console.error('Kullanıcı güncellenirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
}); 