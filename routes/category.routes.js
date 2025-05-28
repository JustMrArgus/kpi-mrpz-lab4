const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { body } = require("express-validator");
const validate = require("../middleware/validate.middleware");
const {
  createCategory,
  getMyCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

router.use(auth);

router
  .route("/")
  .post(
    [body("name").notEmpty().withMessage("Name cannot be empty")],
    validate,
    createCategory
  )
  .get(getMyCategories);

router
  .route("/:id")
  .put(
    [body("name").notEmpty().withMessage("Name cannot be empty")],
    validate,
    updateCategory
  )
  .delete(deleteCategory);

module.exports = router;
