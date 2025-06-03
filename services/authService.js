const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateToken } = require("../utils/token");

const loginUser = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw { statusCode: 401, message: "Username atau password salah" };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { statusCode: 401, message: "Username atau password salah" };
  }

  const accessToken = generateToken(user._id, "1h");
  const refreshToken = generateToken(user._id, "7d");
  const expireAt = Math.floor(Date.now() / 1000) + 3600;

  return {
    userId: user._id,
    username: user.username,
    accessToken,
    refreshToken,
    expireAt,
  };
};

const refreshAccessToken = (refreshToken) => {
  if (!refreshToken) {
    throw { statusCode: 400, message: "Refresh token wajib diisi" };
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const accessToken = generateToken(decoded.id, "1h");
    const expireAt = Math.floor(Date.now() / 1000) + 3600;

    return {
      accessToken,
      expireAt,
    };
  } catch (err) {
    throw {
      statusCode: 401,
      message: "Refresh token tidak valid atau kadaluarsa",
    };
  }
};

module.exports = {
  loginUser,
  refreshAccessToken,
};
