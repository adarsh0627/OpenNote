const {
  createNote,
  getAllNotes,
  getNoteById,
  getSecureFileUrl,
  getUserNotes,
  deleteNote,
} = require("../services/note.service");

exports.uploadNoteController = async (req, res, next) => {
  try {
    const { title, description, tags, price, subject } = req.body;
    const userId = req.user.id;

    if (!req.files?.file || !req.files?.thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Both note file (PDF) and thumbnail are required",
      });
    }

    const fileData = req.files.file[0];
    const thumbnailUrl = req.files.thumbnail[0].path;

    const filePublicId = fileData.filename || fileData.public_id;
    const fileResourceType = "raw";

    const note = await createNote({
      title,
      description,
      tags,
      price,
      subject,
      filePublicId,
      fileResourceType,
      thumbnailUrl,
      userId,
    });

    res.status(201).json({
      success: true,
      message: "Note uploaded successfully",
      note: {
        id: note._id,
        title: note.title,
        price: note.price,
        thumbnail: note.thumbnail,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllNotesController = async (req, res, next) => {
  try {
    const { search, tag, minPrice, maxPrice, page, limit } = req.query;
    const result = await getAllNotes({ search, tag, minPrice, maxPrice, page, limit });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.getNoteByIdController = async (req, res, next) => {
  try {
    const note = await getNoteById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }
    res.status(200).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

exports.getFileUrlController = async (req, res, next) => {
  try {
    const data = await getSecureFileUrl(req.params.id, req.user.id);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    const msg = error?.message || "";
    if (
      msg.includes("Purchase required") ||
      msg.includes("not found") ||
      msg.includes("Access denied")
    ) {
      return res.status(403).json({ success: false, message: msg });
    }
    next(error);
  }
};
exports.getMyNotesController = async (req, res, next) => {
  try {
    const notes = await getUserNotes(req.user.id);
    res.status(200).json({ success: true, notes });
  } catch (error) {
    next(error);
  }
};

exports.deleteNoteController = async (req, res, next) => {
  try {
    await deleteNote(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: "Note deleted" });
  } catch (error) {
    next(error);
  }
};