"use strict";
const router = require("express").Router();
const ctrl = require("../controllers/userInteractionController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/", verifyToken, ctrl.record);
router.get("/me", verifyToken, ctrl.myHistory);

module.exports = router;