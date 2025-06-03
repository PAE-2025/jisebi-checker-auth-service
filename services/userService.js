const User = require("../models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const getAllUsers = async (filterOptions, paginationOptions) => {
  const { username } = filterOptions;
  const { page = 1, limit = 10 } = paginationOptions;
  const skip = (page - 1) * limit;

  const queryFilter = {};
  if (username) {
    queryFilter.username = { $regex: username, $options: "i" };
  }

  const users = await User.find(queryFilter, { password: 0 })
    .skip(skip)
    .limit(limit)
    .sort({ username: 1 })
    .lean();

  const total = await User.countDocuments(queryFilter);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

const getUserById = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("ID pengguna tidak valid");
    err.statusCode = 400;
    throw err;
  }
  const user = await User.findById(userId, { password: 0 }).lean();
  if (!user) {
    const err = new Error("Pengguna tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

const createUser = async (userData) => {
  const { username, password, isAdmin = false } = userData;

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    const err = new Error("Username sudah terdaftar");
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new User({
    username,
    password: hashedPassword,
    isAdmin,
  });
  await newUser.save();
  return {
    id: newUser._id,
    username: newUser.username,
    isAdmin: newUser.isAdmin,
    createdAt: newUser.createdAt,
  };
};

const updateUser = async (userId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("ID pengguna tidak valid");
    err.statusCode = 400;
    throw err;
  }

  const { username, password, isAdmin } = updateData;
  const updates = {};

  if (username) {
    const existingUser = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      const err = new Error("Username sudah digunakan");
      err.statusCode = 400;
      throw err;
    }
    updates.username = username;
  }

  if (password) {
    updates.password = await bcrypt.hash(password, 12);
  }

  if (isAdmin !== undefined) {
    updates.isAdmin = isAdmin;
  }

  if (Object.keys(updates).length === 0) {
    const err = new Error("Tidak ada data untuk diperbarui");
    err.statusCode = 400;
    throw err;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true, fields: { password: 0 } }
  ).lean();

  if (!updatedUser) {
    const err = new Error("Pengguna tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }
  delete updatedUser.password;
  return updatedUser;
};

const deleteUser = async (userIdToDelete, currentUserId) => {
  if (!mongoose.Types.ObjectId.isValid(userIdToDelete)) {
    const err = new Error("ID pengguna tidak valid");
    err.statusCode = 400;
    throw err;
  }

  if (currentUserId === userIdToDelete) {
    const err = new Error("Tidak dapat menghapus akun sendiri");
    err.statusCode = 403; // Forbidden
    throw err;
  }

  const user = await User.findByIdAndDelete(userIdToDelete);
  if (!user) {
    const err = new Error("Pengguna tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }
  return { message: "Pengguna berhasil dihapus" };
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
