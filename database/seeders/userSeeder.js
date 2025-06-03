require("dotenv").config({ path: "../../.env" }); // Sesuaikan path ke .env Anda jika seeder ada di subfolder
const mongoose = require("mongoose");
const User = require("../../models/User"); // Sesuaikan path ke model User Anda
const { createUserFactory } = require("../factories/userFactory"); // Sesuaikan path ke factory
const config = require("../../config"); // Untuk MONGODB_URI jika tidak langsung dari process.env

const MONGODB_URI = process.env.MONGODB_URI || config.mongoURI; // Pastikan MONGODB_URI tersedia

if (!MONGODB_URI) {
  console.error(
    "Kesalahan: MONGODB_URI tidak ditemukan. Pastikan sudah diatur di .env"
  );
  process.exit(1);
}

const seedUsers = async (count = 10) => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Terhubung untuk seeding...");

    console.log("Menghapus data pengguna lama...");
    await User.deleteMany({});
    console.log("Data pengguna lama berhasil dihapus.");

    const usersToCreate = [];
    console.log(`Membuat ${count} data pengguna baru...`);

    for (let i = 0; i < count; i++) {
      if (i === 0) {
        usersToCreate.push(
          await createUserFactory({
            username: "admin",
            isAdmin: true,
            password: "password123",
          })
        );
      } else {
        usersToCreate.push(await createUserFactory());
      }
    }

    await User.insertMany(usersToCreate);
    console.log(`${count} pengguna berhasil ditambahkan ke database.`);
  } catch (error) {
    console.error("Error saat menjalankan seeder pengguna:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Koneksi MongoDB ditutup.");
  }
};

const numberOfUsers = process.argv[2] ? parseInt(process.argv[2], 10) : 10;

if (isNaN(numberOfUsers) || numberOfUsers <= 0) {
  console.log("Jumlah pengguna tidak valid. Gunakan angka positif.");
} else {
  seedUsers(numberOfUsers);
}
