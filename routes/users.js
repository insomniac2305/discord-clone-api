const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { checkAuth } = require("../middleware/auth");

router.get("/", checkAuth(), userController.getUsers);

router.post("/", userController.postUsers);

router.get("/:userid", checkAuth(), userController.getUser);

router.put("/:userid", checkAuth(), userController.putUser);

router.delete("/:userid", checkAuth(), userController.deleteUser);

module.exports = router;
