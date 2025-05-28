const User = require("../models/user.model");

exports.getMyProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateMyProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update profile", error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: `User ${user.username} has been deleted` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
