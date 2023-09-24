const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.get("/", function (req, res, next) {
  res.redirect("./api");
});

module.exports = router;
