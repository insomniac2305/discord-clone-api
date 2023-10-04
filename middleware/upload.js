require("dotenv").config();
const multer = require("multer");
const path = require("path");
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
  filename: function (req, file, cb) {
    const newName = Math.round(Math.random() * 1e12).toString() + path.extname(file.originalname);
    cb(null, newName);
  },
});

const upload = multer({ storage, fileFilter: filterImages, limits: { fileSize: maxSize } });

module.exports = upload;
