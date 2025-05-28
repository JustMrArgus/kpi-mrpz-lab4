const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const permit = require("../middleware/role.middleware");
const {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getUserById,
  deleteUser,
} = require("../controllers/user.controller");

router.use(auth);

router.route("/me").get(getMyProfile).put(updateMyProfile);

router.use(permit("admin"));

router.route("/").get(getAllUsers);

router.route("/:id").get(getUserById).delete(deleteUser);

module.exports = router;
