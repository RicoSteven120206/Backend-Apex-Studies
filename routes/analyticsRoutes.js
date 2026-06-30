"use strict";
const router = require("express").Router();
const ctrl   = require("../controllers/analyticsController");
const { verifyToken, adminOnly, checkUserActive } = require("../middlewares/authMiddleware");

const auth       = [verifyToken, checkUserActive];
const adminGuard = [verifyToken, adminOnly];

// ── User ──
router.get("/activity", ...auth, ctrl.myActivityLog);
router.get("/search-history", ...auth, ctrl.getSearchHistory);
router.delete("/search-history", ...auth, ctrl.clearSearchHistory);
router.get("/subject-preference", ...auth, ctrl.getSubjectPreference);
router.post("/feedback", ...auth, ctrl.saveFeedback);
router.get("/recommendations", ...auth, ctrl.myRecommendations);

// ── Admin ──
router.get("/admin/stats", ...adminGuard, ctrl.systemStats);
router.get("/admin/popular", ...adminGuard, ctrl.popularContent);
router.get("/admin/users/:userId", ...adminGuard, ctrl.getUserActivity);

module.exports = router;
