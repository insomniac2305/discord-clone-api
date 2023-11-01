const mongoose = require("mongoose");
require("dotenv").config();

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      get: function (avatar) {
        if (avatar) {
          return `${process.env.BASE_URL}/files/users/${this._id}/${avatar}`;
        } else {
          return undefined;
        }
      },
    },
  },
  { toJSON: { getters: true } }
);

module.exports = mongoose.model("User", userSchema);
