const express = require("express");
const router = express.Router();
const userRouter = require("./users");
const serverRouter = require("./servers");
const { checkAuth } = require("../middleware/auth");

router.get("/", function (req, res, next) {
  res.json({ message: "Welcome to the Discord Clone API" });
});

router.use("/users", userRouter);
router.use("/servers", checkAuth(), serverRouter);

module.exports = router;
