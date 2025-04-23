// Import library yang dibutuhkan
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Inisialisasi Express
const app = express();
app.use(express.json());

// Rate Limiting untuk keamanan
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // Maksimal 100 request per IP
    message: 'Terlalu banyak percobaan, coba lagi nanti.'
});
app.get('/', async(req, res)=>{
    return res.json({message: "AUTH SERVICE JISEBI CHECKER"})
});

app.use('/login', limiter);

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Model User
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

// Helper untuk membuat token
const generateToken = (id, expiresIn) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

// Middleware untuk verifikasi JWT
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization') ? req.header('Authorization').replace("Bearer ", "") : null;
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Register
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const accessToken = generateToken(user._id, '1h');
        const refreshToken = generateToken(user._id, '7d');
        const expireAt = Math.floor(Date.now() / 1000) + 3600; // 1 jam dari sekarang

        res.json({ accessToken, refreshToken, expireAt });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Refresh Token
app.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }

            const accessToken = generateToken(decoded.id, '1h');
            const expireAt = Math.floor(Date.now() / 1000) + 3600;
            res.json({ accessToken, expireAt });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Endpoint untuk layanan lain dalam memverifikasi token
app.post('/verify-token', authMiddleware, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));