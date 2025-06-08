require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const connectDB = require("./config/db");
const config = require("./config");

connectDB();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  console.error("Error handler:", err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Terjadi kesalahan server",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

app.get("/", (req, res) => {
  res.send("Selamat datang di API Auth!");
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

module.exports = app;
