const express = require("express");
const router = express.Router();
const {
  createTask,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getAllTasks,
} = require("../controllers/task.controller");
const auth = require("../middleware/auth.middleware");
const permit = require("../middleware/role.middleware");
const { body } = require("express-validator");
const validate = require("../middleware/validate.middleware");

const updateTaskValidation = [
  body("title")
    .optional()
    .isString()
    .withMessage("Title, if provided, must be a string.")
    .isLength({ min: 3 })
    .withMessage("Title, if provided, must be at least 3 chars long."),
  body("description")
    .optional()
    .isString()
    .withMessage("Description, if provided, must be a string."),
  body("status")
    .optional()
    .isIn(["pending", "in_progress", "completed"])
    .withMessage("Invalid status value."),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority value."),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for dueDate.")
    .toDate(),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags, if provided, must be an array."),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Category ID, if provided, must be a valid MongoDB ObjectId."),
];

const createTaskValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required for a new task.")
    .isString()
    .withMessage("Title must be a string.")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 chars long."),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string."),
  body("status")
    .optional()
    .isIn(["pending", "in_progress", "completed"])
    .withMessage("Invalid status value."),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority value."),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for dueDate.")
    .toDate(),
  body("tags").optional().isArray().withMessage("Tags must be an array."),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Category ID must be a valid MongoDB ObjectId."),
];

router
  .route("/")
  .post(auth, createTaskValidation, validate, createTask)
  .get(auth, getMyTasks);

router
  .route("/:id")
  .get(auth, getTaskById)
  .put(auth, updateTaskValidation, validate, updateTask)
  .delete(auth, deleteTask);

router.route("/admin/all").get(auth, permit("admin"), getAllTasks);

module.exports = router;
