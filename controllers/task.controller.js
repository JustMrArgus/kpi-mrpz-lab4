const Task = require("../models/task.model");
const Category = require("../models/category.model");

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags, category } =
      req.body;

    if (category) {
      const categoryExists = await Category.findOne({
        _id: category,
        user: req.user._id,
      });
      if (!categoryExists) {
        return res
          .status(404)
          .json({ message: "Category not found or does not belong to you" });
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      category,
      user: req.user._id,
    });
    res.status(201).json(task);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create task", error: err.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const { status, priority, sortBy, category } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    let sortOptions = {};
    if (sortBy) {
      const parts = sortBy.split(":");
      sortOptions[parts[0]] = parts[1] === "desc" ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const tasks = await Task.find(query)
      .populate("category", "name")
      .sort(sortOptions);
    res.json(tasks);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve tasks", error: err.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("category", "name");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { category } = req.body;
    if (category) {
      const categoryExists = await Category.findOne({
        _id: category,
        user: req.user._id,
      });
      if (!categoryExists) {
        return res
          .status(404)
          .json({ message: "Category not found or does not belong to you" });
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task)
      return res
        .status(404)
        .json({ message: "Task not found or you do not have access" });
    res.json(task);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update task", error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!task)
      return res
        .status(404)
        .json({ message: "Task not found or you do not have access" });
    res.status(200).json({ message: "Task successfully deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete task", error: err.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("user", "username email")
      .populate("category", "name");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};