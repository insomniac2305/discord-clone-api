const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Roles = {
  Admin: "admin",
  Member: "member",
};

const memberSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, required: true, enum: Object.values(Roles), default: Roles.Member },
});

const serverSchema = new Schema({
  name: { type: String, required: true },
  iconUrl: { type: String },
  channels: [{ type: Schema.Types.ObjectId, ref: "Channel" }],
  members: [memberSchema],
});

module.exports = mongoose.model("Server", serverSchema);
module.exports.Roles = Roles;
