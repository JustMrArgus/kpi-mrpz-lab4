const permit = (...allowedRoles) => {
  return (req, res, next) => {
    if (req.user && allowedRoles.includes(req.user.role)) {
      next();
    } else {
      console.warn(
        `Forbidden: User ${
          req.user ? req.user.email : "Guest"
        } tried to access a route restricted to roles: ${allowedRoles.join(
          ", "
        )}. User role: ${req.user ? req.user.role : "None"}`
      );
      res.status(403).json({ message: "Access forbidden" });
    }
  };
};
module.exports = permit;
