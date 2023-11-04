const mongoose = require("mongoose");
require("dotenv").config();

const Schema = mongoose.Schema;

const Roles = {
  Admin: "admin",
  Member: "member",
};

const memberSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, required: true, enum: Object.values(Roles), default: Roles.Member },
});

const serverSchema = new Schema(
  {
    name: { type: String, required: true },
    icon: {
      type: String,
      get: function (icon) {
        if (icon) {
          return `${process.env.BASE_URL}/files/servers/${this._id}/${icon}`;
        } else {
          return undefined;
        }
      },
    },
    channels: [{ type: Schema.Types.ObjectId, ref: "Channel" }],
    members: [memberSchema],
  },
  { toJSON: { getters: true } }
);

module.exports = mongoose.model("Server", serverSchema);
module.exports.Roles = Roles;
