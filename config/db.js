const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Kesalahan: MONGODB_URI tidak ditemukan di file .env");
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Terhubung...");
  } catch (err) {
    console.error("MongoDB Gagal Terhubung:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
