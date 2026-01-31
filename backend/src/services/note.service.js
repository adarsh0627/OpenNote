const Note = require("../models/note.model");

const uploadNote = async ({
  title,
  description,
  tags,
  price,
  fileUrl,
  thumbnailUrl,
  userId,
}) => {
  const note = await Note.create({
    title,
    description,
    tags,
    price,
    file: fileUrl,
    thumbnail: thumbnailUrl,
    uploadedBy: userId,
  });

  return note;
};

module.exports = { uploadNote };
