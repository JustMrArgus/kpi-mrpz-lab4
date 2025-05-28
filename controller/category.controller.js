category.controller.js

const Category = require("../models/category.model");
const Task = require("../models/task.model");

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const existingCategory = await Category.findOne({
      name,
      user: req.user._id,
    });
    if (existingCategory) {
      return res
        .status(409)
        .json({ message: "A category with this name already exists" });
    }
    const category = await Category.create({ name, user: req.user._id });
    res.status(201).json(category);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create category", error: err.message });
  }
};

exports.getMyCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id });
    res.json(categories);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve categories", error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found or you do not have access" });
    }
    res.json(category);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update category", error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findOne({
      _id: categoryId,
      user: req.user._id,
    });

    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found or you do not have access" });
    }

    await Task.updateMany(
      { category: categoryId },
      { $unset: { category: 1 } }
    );

    await Category.deleteOne({ _id: categoryId });

    res.json({ message: "Category successfully deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete category", error: err.message });
  }
};