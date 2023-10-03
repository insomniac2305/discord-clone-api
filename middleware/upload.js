require("dotenv").config();
const multer = require("multer");
const maxSize = 10 * 1024 * 1024; // 10 MB

const filterImages = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_FOLDER,
});

const upload = multer({ storage, fileFilter: filterImages, limits: { fileSize: maxSize } });

module.exports = upload;
