const express = require("express");
const upload = require("../middlewares/upload.middleware");
const { uploadNoteController } = require("../controllers/note.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/notes",
  authMiddleware,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadNoteController
);

module.exports = router;
