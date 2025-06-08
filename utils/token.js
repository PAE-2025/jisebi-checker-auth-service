const jwt = require("jsonwebtoken");

const generateToken = (id, expiresIn) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

module.exports = { generateToken }