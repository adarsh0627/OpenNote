exports.adminMiddleware = (req, res, next) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    return res.status(500).json({ success: false, message: "Admin not configured" });
  }
  if (req.user?.email !== adminEmail) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};