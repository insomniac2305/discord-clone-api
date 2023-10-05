const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const { param, validationResult, body } = require("express-validator");
const { bodyRequired, catchValidationErrors, moveUpload } = require("./controllerHelper");
const User = require("../models/User");
const upload = require("../middleware/upload");

const addParamUserToReq = [
  param("userid").isMongoId().withMessage("User ID is not valid"),
  catchValidationErrors,
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.userid);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    req.queriedUser = user;

    return next();
  }),
];

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, "-password");
  return res.json(users);
});

exports.postUsers = [
  upload.single("avatar"),
  bodyRequired("name", "Username"),
  bodyRequired("email", "E-mail")
    .isEmail()
    .withMessage("E-Mail has invalid format")
    .custom(async (email) => {
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        throw new Error("E-mail is already in use");
      }
    }),
  bodyRequired("password", "Password"),
  catchValidationErrors,
  asyncHandler(async (req, res, next) => {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
    });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;

    if (req.file) {
      await moveUpload(req.file.filename, "users", user._id.toString());
      user.avatar = req.file.filename;
    }

    await user.save();
    
    user.password = undefined;

    return res.status(201).json(user);
  }),
];

exports.getUser = [
  addParamUserToReq,
  asyncHandler(async (req, res) => {
    req.queriedUser.password = undefined;
    return res.json(req.queriedUser);
  }),
];

exports.putUser = [
  addParamUserToReq,
  upload.single("avatar"),
  body("name").trim().escape(),
  body("email").trim().escape().isEmail().withMessage("E-Mail has invalid format").optional({ values: "null" }),
  body("password").trim().escape(),
  body("oldpassword")
    .trim()
    .escape()
    .if(body("password").notEmpty())
    .notEmpty()
    .withMessage("Old password must be specified when changing the password")
    .custom(async (oldpassword, { req }) => {
      const user = req.queriedUser;
      const passwordMatches = await bcrypt.compare(oldpassword, user.password);
      if (!passwordMatches) {
        throw new Error("Old password is incorrect");
      }
    }),
  catchValidationErrors,
  asyncHandler(async (req, res, next) => {
    const user = req.queriedUser;

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;

    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      user.password = hashedPassword;
    }

    if (req.file) {
      await moveUpload(req.file.filename, "users", user._id.toString());
      user.avatar = req.file.filename;
    }

    await user.save();

    user.password = undefined;

    return res.json(user);
  }),
];

exports.deleteUser = [
  addParamUserToReq,
  asyncHandler(async (req, res, next) => {
    const user = req.queriedUser;
    await user.deleteOne();
    return res.status(204).send();
  }),
];
