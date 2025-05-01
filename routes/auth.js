const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { success, error } = require("../utils/response");

const router = express.Router();

const generateToken = (id, expiresIn) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return error(res, "Username dan password wajib diisi", null, 400);

    const existingUser = await User.findOne({ username });
    if (existingUser) return error(res, "Username sudah terdaftar", null, 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ username, password: hashedPassword }).save();

    return success(res, "Registrasi berhasil", null, 201);
  } catch (err) {
    return error(res, "Terjadi kesalahan server", err.message);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return error(res, "Username dan password wajib diisi", null, 400);

    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return error(res, "Username atau password salah", null, 400);

    const accessToken = generateToken(user._id, "1h");
    const refreshToken = generateToken(user._id, "7d");
    const expireAt = Math.floor(Date.now() / 1000) + 3600;

    return success(res, "Login berhasil", {
      accessToken,
      refreshToken,
      expireAt,
    });
  } catch (err) {
    return error(res, "Terjadi kesalahan server", err.message);
  }
});

// Refresh
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return error(res, "Refresh token wajib diisi", null, 400);

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return error(res, "Refresh token tidak valid", err.message, 401);

      const accessToken = generateToken(decoded.id, "1h");
      const expireAt = Math.floor(Date.now() / 1000) + 3600;
      return success(res, "Access token baru berhasil dibuat", {
        accessToken,
        expireAt,
      });
    });
  } catch (err) {
    return error(res, "Terjadi kesalahan server", err.message);
  }
});

// Verify Token
router.post("/verify-token", authMiddleware, (req, res) => {
  return success(res, "Token valid", { user: req.user });
});

module.exports = router;
