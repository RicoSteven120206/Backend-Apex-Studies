"use strict";
const router = require("express").Router();
const ctrl = require("../controllers/subjectController");
const { verifyToken, adminOnly } = require("../middlewares/authMiddleware");

router.get("/", ctrl.list);
router.get("/:id", ctrl.detail);
router.post("/", verifyToken, adminOnly, ctrl.create);
router.put("/:id", verifyToken, adminOnly, ctrl.update);
router.delete("/:id", verifyToken, adminOnly, ctrl.remove);

module.exports = router;