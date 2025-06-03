const express = require("express");
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

const createUserValidation = [
  body("username")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Username harus memiliki 4-20 karakter")
    .isAlphanumeric()
    .withMessage("Username hanya boleh berisi huruf dan angka"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter")
    .matches(/\d/)
    .withMessage("Password harus mengandung minimal 1 angka"),
  body("isAdmin").optional().isBoolean().withMessage("isAdmin harus boolean"),
];

const updateUserValidation = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Username harus memiliki 4-20 karakter")
    .isAlphanumeric()
    .withMessage("Username hanya boleh berisi huruf dan angka"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter")
    .matches(/\d/)
    .withMessage("Password harus mengandung minimal 1 angka"),
  body("isAdmin").optional().isBoolean().withMessage("isAdmin harus boolean"),
];

router.get("/", userController.listUsers);

router.get("/:id", userController.getUser);

router.post("/", createUserValidation, userController.postUser);

router.put("/:id", updateUserValidation, userController.putUser);

router.delete("/:id", userController.removeUser);

module.exports = router;
