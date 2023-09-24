const asyncHandler = require("express-async-handler");
const { param } = require("express-validator");
const { bodyRequired, catchValidationErrors } = require("./controllerHelper");
const Server = require("../models/Server");
const User = require("../models/User");
const { addParamServerToReq, checkServerPermissions } = require("./serverController");

const addParamMemberToReq = [
  param("memberid").isMongoId().withMessage("Member ID is not valid"),
  catchValidationErrors,
  asyncHandler(async (req, res, next) => {
    const queriedMember = req.queriedServer.members.find((member) => member.user.toString() === req.params.memberid);

    if (!queriedMember) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    req.queriedMember = queriedMember;

    return next();
  }),
];

exports.getServerMembers = [
  addParamServerToReq,
  asyncHandler(async (req, res) => {
    const server = req.queriedServer;
    await server.populate("members.user", "-password");
    return res.json(server.members);
  }),
];

exports.postServerMembers = [
  addParamServerToReq,
  bodyRequired("userid", "User ID")
    .isMongoId()
    .withMessage("User ID is not valid")
    .custom(async (id, { req }) => {
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User does not exist");
      }

      if (req.queriedServer.members.find((member) => member.user.toString() === id)) {
        throw new Error("User is already a member");
      }
    }),
  bodyRequired("role", "Member role")
    .isIn(Object.values(Server.Roles))
    .withMessage("Member role must be member or admin"),
  catchValidationErrors,
  asyncHandler(async (req, res) => {
    const server = req.queriedServer;

    server.members.push({
      user: req.body.userid,
      role: req.body.role,
    });

    await server.save();

    return res.json(server.members[-1]);
  }),
];

exports.putServerMember = [
  addParamServerToReq,
  addParamMemberToReq,
  checkServerPermissions(Server.Roles.Admin),
  bodyRequired("role", "Member role")
    .isIn(Object.values(Server.Roles))
    .withMessage("Member role must be member or admin"),
  catchValidationErrors,
  asyncHandler(async (req, res) => {
    const server = req.queriedServer;
    const member = req.queriedMember;

    member.role = req.body.role;

    await server.save();

    return res.json(member);
  }),
];

exports.deleteServerMember = [
  addParamServerToReq,
  addParamMemberToReq,
  checkServerPermissions(Server.Roles.Admin),
  asyncHandler(async (req, res) => {
    const server = req.queriedServer;
    const member = req.queriedMember;

    member.deleteOne();
    await server.save();

    return res.status(204).send();
  }),
];
