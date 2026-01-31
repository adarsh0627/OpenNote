const { uploadNote } = require("../services/note.service");

exports.uploadNoteController = async (req, res) => {
  try {
    const { title, description, tags, price } = req.body;
    const userId = req.user.id; 

    if (!req.files?.file || !req.files?.thumbnail) {
      return res.status(400).json({
        success: false,
        message: "File and thumbnail are required",
      });
    }

    const fileUrl = req.files.file[0].path;
    const thumbnailUrl = req.files.thumbnail[0].path;

    const note = await uploadNote({
      title,
      description,
      tags,
      price,
      fileUrl,
      thumbnailUrl,
      userId,
    });

    return res.status(201).json({
      success: true,
      message: "Note uploaded successfully",
      note: {
        id: note._id,
        title: note.title,
        description: note.description,
        tags: note.tags,
        price: note.price,
        thumbnail: note.thumbnail,
        file: note.file,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while uploading note",
    });
  }
};
