const multer = require("multer");

function multerErrorHandler(err, req, res, next) {
  console.error("Multer/Error middleware caught:", err && err.stack ? err.stack : err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        status: false,
        message: "You can only upload 4 thumbnails (field: thumbnails) and 1 main image (field: image).",
        code: err.code
      });
    }
    return res.status(400).json({
      status: false,
      message: err.message,
      code: err.code
    });
  }

  if (err) {
    return res.status(500).json({
      status: false,
      message: "Server error during upload",
      error: err.message || String(err)
    });
  }

  next();
}

module.exports = multerErrorHandler;
