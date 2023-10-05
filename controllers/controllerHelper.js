require("dotenv").config();
const path = require("path");
const fs = require("fs/promises");
const { body, validationResult } = require("express-validator");

exports.bodyRequired = (field, fieldName) =>
  body(field).trim().notEmpty().escape().withMessage(`${fieldName} must be specified`);

exports.catchValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      fields: req.body,
      message: "Invalid request, check errors",
      errors: errors.array(),
    });
  }

  return next();
};

exports.moveUpload = async (fileName, subfolder, id) => {
  const filePath = path.join(process.cwd(), process.env.UPLOAD_FOLDER, fileName);
  const newDirectory = path.join(process.cwd(), process.env.UPLOAD_FOLDER, subfolder, id);

  let dirExists;
  try {
    await fs.access(newDirectory);
    dirExists = true;
  } catch (error) {
    dirExists = false;
  }

  if (!dirExists) {
    await fs.mkdir(newDirectory, { recursive: true });
  }

  const newFilePath = path.join(newDirectory, fileName);
  await fs.rename(filePath, newFilePath);
};

exports.deleteUploadDir = async (subfolder, id) => {
  const dir = path.join(process.cwd(), process.env.UPLOAD_FOLDER, subfolder, id);
  await fs.rm(dir, { recursive: true, force: true });
};
