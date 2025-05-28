const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");
const { body } = require("express-validator");
const validate = require("../middleware/validate.middleware");

const registerValidation = [
  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("email").isEmail().withMessage("Please enter a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email address"),
  body("password").notEmpty().withMessage("Password cannot be empty"),
];

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);

module.exports = router;
