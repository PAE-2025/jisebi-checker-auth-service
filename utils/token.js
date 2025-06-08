import jwt from "jsonwebtoken";

export const generateToken = (id, expiresIn) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};
