"use strict";
const router = require("express").Router();
const ctrl   = require("../controllers/learningPathController");
const { verifyToken, optionalAuth, adminOnly, checkUserActive } = require("../middlewares/authMiddleware");

const auth       = [verifyToken, checkUserActive];
const adminGuard = [verifyToken, adminOnly];

// ── Publik / User ──
router.get("/",        optionalAuth, ctrl.list);
router.get("/:id",     optionalAuth, ctrl.detail);

// ── Admin ──
router.post("/",                           ...adminGuard, ctrl.create);
router.put("/:id",                         ...adminGuard, ctrl.update);
router.delete("/:id",                      ...adminGuard, ctrl.remove);
router.post("/:id/contents",              ...adminGuard, ctrl.addContent);
router.delete("/:id/contents/:contentId", ...adminGuard, ctrl.removeContent);
router.put("/:id/reorder",                ...adminGuard, ctrl.reorder);

module.exports = router;
