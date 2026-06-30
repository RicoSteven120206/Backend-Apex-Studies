"use strict";
const router = require("express").Router();
const ctrl = require("../controllers/catalogController");
const { verifyToken, checkUserActive } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, checkUserActive, ctrl.index);

module.exports = router;