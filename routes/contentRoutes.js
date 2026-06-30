"use strict";
const router = require("express").Router();
const ctrl   = require("../controllers/contentController");
const { verifyToken, optionalAuth, adminOnly, checkUserActive } = require("../middlewares/authMiddleware");

const auth       = [verifyToken, checkUserActive];
const adminGuard = [verifyToken, adminOnly];

// ── User (publik / opsional login) ──
router.get("/search",          optionalAuth, ctrl.search);
router.get("/",                optionalAuth, ctrl.list);
router.get("/:id",             optionalAuth, ctrl.detail);

// ── User (wajib login) ──
router.post("/:id/complete",   ...auth, ctrl.markComplete);
router.post("/:id/toggle",     ...auth, ctrl.toggleInteraction);

// ── Admin ──
router.get("/admin/list",              ...adminGuard, ctrl.adminList);
router.post("/admin",                  ...adminGuard, ctrl.create);
router.put("/admin/:id",               ...adminGuard, ctrl.update);
router.delete("/admin/:id",            ...adminGuard, ctrl.remove);
router.post("/admin/system/retrain",   ...adminGuard, ctrl.retrainModel);

module.exports = router;
