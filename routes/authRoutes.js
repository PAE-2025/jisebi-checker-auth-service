const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Terlalu banyak percobaan login, coba lagi nanti" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rute Login
router.post(
  "/login",
  loginLimiter,
  [
    body("username").trim().notEmpty().withMessage("Username wajib diisi"),
    body("password").notEmpty().withMessage("Password wajib diisi"),
  ],
  authController.login
);

// Rute Refresh Token
router.post(
  "/refresh",
  [body("refreshToken").notEmpty().withMessage("Refresh token wajib diisi")],
  authController.refresh
);

// Rute Verify Token
router.post("/verify-token", authMiddleware, authController.verifyToken);

module.exports = router;
