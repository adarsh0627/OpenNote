const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const {
  uploadNoteController,
  getAllNotesController,
  getNoteByIdController,
  getFileUrlController,
  getMyNotesController,
  deleteNoteController,
} = require("../controllers/note.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { validateNoteUpload } = require("../validators/note.validator");

// ⚠️ Static routes MUST come before /:id
router.get("/", getAllNotesController);
router.get("/my", authMiddleware, getMyNotesController);       // ← before /:id
router.get("/:id", getNoteByIdController);
router.get("/:id/file", authMiddleware, getFileUrlController);

router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  validateNoteUpload,
  uploadNoteController
);

router.delete("/:id", authMiddleware, deleteNoteController);

module.exports = router;