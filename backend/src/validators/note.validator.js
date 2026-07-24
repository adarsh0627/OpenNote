const { body, validationResult } = require("express-validator");

exports.validateNoteUpload = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 150 }).withMessage("Title cannot exceed 150 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),

  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be 0 or more")
    .custom((v) => {
      if (Number(v) > 0 && Number(v) < 10) throw new Error("Minimum paid price is ₹10");
      return true;
    }),

  body("tags")
    .custom((v) => {
      if (!v) throw new Error("Tags are required");
      const tags = typeof v === "string"
        ? v.split(",").map((t) => t.trim()).filter(Boolean)
        : Array.isArray(v) ? v : [];
      if (tags.length === 0) throw new Error("At least one tag is required");
      if (tags.length > 10) throw new Error("Maximum 10 tags allowed");
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }
    next();
  },
];