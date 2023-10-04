require("dotenv").config();
const path = require("path");
const fs = require("fs/promises");
const asyncHandler = require("express-async-handler");

exports.getFile = asyncHandler(async (req, res) => {
  const { directory, id, fileName } = req.params;
  const filePath = path.join(process.cwd(), process.env.UPLOAD_FOLDER, directory, id, fileName);

  if (!directory || !id || !fileName) {
    return res.status(400).send("File not specified");
  }

  let fileExists;
  try {
    await fs.access(filePath);
    fileExists = true;
  } catch (error) {
    fileExists = false;
  }

  if (fileExists) {
    return res.sendFile(filePath);
  } else {
    return res.status(404).send("File not found");
  }
});
