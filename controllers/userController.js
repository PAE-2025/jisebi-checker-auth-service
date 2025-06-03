const { validationResult } = require("express-validator");
const userService = require("../services/userService");
const { success, error } = require("../utils/response");

const listUsers = async (req, res) => {
  try {
    const filterOptions = {
      username: req.query.username,
    };
    const paginationOptions = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };
    const result = await userService.getAllUsers(
      filterOptions,
      paginationOptions
    );
    return success(res, "Daftar pengguna berhasil diambil", result);
  } catch (err) {
    console.error("Get users error:", err);
    return error(
      res,
      err.message || "Terjadi kesalahan server",
      null,
      err.statusCode || 500
    );
  }
};

const getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return success(res, "Data pengguna berhasil diambil", { user });
  } catch (err) {
    console.error("Get user error:", err);
    return error(
      res,
      err.message || "Terjadi kesalahan server",
      null,
      err.statusCode || 500
    );
  }
};

const postUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, "Validasi gagal", errors.array(), 400);
    }
    const newUser = await userService.createUser(req.body);
    return success(res, "Pengguna berhasil dibuat", { user: newUser }, 201);
  } catch (err) {
    console.error("Create user error:", err);
    return error(
      res,
      err.message || "Terjadi kesalahan server",
      null,
      err.statusCode || 500
    );
  }
};

const putUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, "Validasi gagal", errors.array(), 400);
    }
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    return success(res, "Pengguna berhasil diperbarui", { user: updatedUser });
  } catch (err) {
    console.error("Update user error:", err);
    return error(
      res,
      err.message || "Terjadi kesalahan server",
      null,
      err.statusCode || 500
    );
  }
};

const removeUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id, req.user.id);
    return success(res, result.message || "Pengguna berhasil dihapus", null);
  } catch (err) {
    console.error("Delete user error:", err);
    return error(
      res,
      err.message || "Terjadi kesalahan server",
      null,
      err.statusCode || 500
    );
  }
};

module.exports = {
  listUsers,
  getUser,
  postUser,
  putUser,
  removeUser,
};
