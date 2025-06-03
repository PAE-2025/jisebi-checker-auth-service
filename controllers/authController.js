const { validationResult } = require("express-validator");
const authService = require("../services/authService");
const { success, error } = require("../utils/response");
const User = require("../models/User");

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, "Validasi gagal", errors.array(), 400);
    }

    const { username, password } = req.body;
    const loginData = await authService.loginUser(username, password);
    return success(res, "Login berhasil", loginData);
  } catch (err) {
    console.error("Login error:", err.message || err);
    return error(
      res,
      err.message || "Terjadi kesalahan server",
      null,
      err.statusCode || 500
    );
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokenData = authService.refreshAccessToken(refreshToken);
    return success(res, "Access token baru berhasil dibuat", tokenData);
  } catch (err) {
    console.error("Refresh token error:", err.message || err);
    return error(
      res,
      err.message || "Terjadi kesalahan server",
      null,
      err.statusCode || 500
    );
  }
};

const verifyToken = async (req, res) => {
  try {
    const userFromDb = await User.findById(req.user.id).select("username");
    if (!userFromDb) {
      return error(res, "User tidak ditemukan", null, 404);
    }

    return success(res, "Token valid", {
      user: {
        id: req.user.id,
        username: userFromDb.username,
      },
    });
  } catch (err) {
    console.error("Verify token error:", err);
    return error(res, "Terjadi kesalahan saat verifikasi token", null, 500);
  }
};

module.exports = {
  login,
  refresh,
  verifyToken,
};
