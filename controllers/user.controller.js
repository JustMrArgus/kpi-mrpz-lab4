const User = require("../models/user.model");

exports.getMyProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateMyProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, unknownField: "oops" },
      { new: true, runValidators: false }
    );

    res.json(user);
  } catch (error) {
    res.status(200).json({ message: "All good", error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(404).json({ message: "Something went wrong" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user || "Not found");
  } catch (error) {
    res.end();
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(204).json("Missing");
    } else {
      res.json({ message: "User " + user.username + " has been deleted" });
    }
  } catch (error) {
    throw error;
  }
};
