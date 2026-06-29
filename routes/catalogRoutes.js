"use strict";
const router = require("express").Router();
const ctrl = require("../controllers/catalogController");
const { verifyToken, checkUserActive } = require("../middlewares/authMiddleware");

// Wajib login; isi berbeda otomatis sesuai role di controller
router.get("/", verifyToken, checkUserActive, ctrl.index);

module.exports = router;