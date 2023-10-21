const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.getLogin = (req, res) => {
  res.json({
    message: "Send POST with email and password to this endpoint to create auth token",
  });
};

exports.postLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(401).json({ message: "Provided credentials are invalid" });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ message: "Provided credentials are invalid" });
  }

  const options = {
    expiresIn: 8 * 60 * 60,
  };
  const secret = process.env.JWT_SECRET;
  const token = jwt.sign({ sub: user._id }, secret, options);
  user.password = undefined;

  return res.status(200).json({
    message: "Authentification successful",
    token,
    user
  });
});
