const Note = require("../models/note.model");
const Purchase = require("../models/purchase.model");
const cloudinary = require("../config/cloudinary");

// ── Generate signed Cloudinary URL ────────────────────────────────────────────
const generateSignedUrl = (publicId, resourceType = "raw", expiresIn = 300) => {
  const expireAt = Math.floor(Date.now() / 1000) + expiresIn;

  const url = cloudinary.url(publicId, {
    resource_type: resourceType,
    type: "private", // files are uploaded with type:"private" — must match here
    sign_url: true,
    secure: true,
    expires_at: expireAt,
  });

  return url;
};

// ── Create note ───────────────────────────────────────────────────────────────
exports.createNote = async ({
  title, description, tags, price,
  filePublicId, fileResourceType, thumbnailUrl, subject, userId,
}) => {
  const normalizedTags =
    typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : tags;

  return Note.create({
    title,
    description,
    tags: normalizedTags,
    subject,
    price: parseFloat(price),
    thumbnail: thumbnailUrl,
    filePublicId,
    fileResourceType,
    uploadedBy: userId,
  });
};

// ── Get all notes ─────────────────────────────────────────────────────────────
exports.getAllNotes = async ({ search, tag, minPrice, maxPrice, page = 1, limit = 20 }) => {
  const query = { isActive: true };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  if (tag) query.tags = { $in: [tag] };
  if (minPrice !== undefined) query.price = { ...query.price, $gte: Number(minPrice) };
  if (maxPrice !== undefined) query.price = { ...query.price, $lte: Number(maxPrice) };

  const skip = (page - 1) * limit;
  const total = await Note.countDocuments(query);

  const notes = await Note.find(query)
    .populate("uploadedBy", "userName avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select("-filePublicId -fileResourceType");

  return { notes, total, page: Number(page), pages: Math.ceil(total / limit) };
};

// ── Get note by ID ────────────────────────────────────────────────────────────
exports.getNoteById = async (noteId) => {
  return Note.findOne({ _id: noteId, isActive: true })
    .populate("uploadedBy", "userName avatar education")
    .select("-filePublicId -fileResourceType");
};

// ── Get secure file URL ───────────────────────────────────────────────────────
exports.getSecureFileUrl = async (noteId, userId) => {
  const note = await Note.findOne({ _id: noteId, isActive: true })
    .select("+filePublicId +fileResourceType");

  if (!note) throw new Error("Note not found");

  const isOwner = note.uploadedBy.toString() === userId.toString();

  if (!isOwner) {
    const purchase = await Purchase.findOne({
      user: userId,
      note: noteId,
      status: { $in: ["SUCCESS", "FREE"] },
    });
    if (!purchase) throw new Error("Access denied — purchase this note to view it");
  }

  const url = generateSignedUrl(note.filePublicId, note.fileResourceType, 300);
  return { url, expiresIn: 300 };
};

// ── Get user's own notes ──────────────────────────────────────────────────────
exports.getUserNotes = async (userId) => {
  return Note.find({ uploadedBy: userId, isActive: true })
    .sort({ createdAt: -1 })
    .select("-filePublicId -fileResourceType");
};

// ── Soft delete note ──────────────────────────────────────────────────────────
exports.deleteNote = async (noteId, userId) => {
  const note = await Note.findOne({ _id: noteId, uploadedBy: userId });
  if (!note) throw new Error("Note not found or unauthorized");
  note.isActive = false;
  await note.save();
  return note;
};