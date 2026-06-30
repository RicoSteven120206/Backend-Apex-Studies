"use strict";
const router = require("express").Router();
const ctrl   = require("../controllers/recommendationController");
const { verifyToken, optionalAuth, checkUserActive } = require("../middlewares/authMiddleware");

const auth = [verifyToken, checkUserActive];

router.post("/questionnaire", optionalAuth, ctrl.questionnaire);
router.get("/content-based/:contentId", optionalAuth, ctrl.contentBased);
router.get("/collaborative", ...auth, ctrl.collaborative);
router.get("/hybrid", ...auth, ctrl.hybrid);        // ← BARU
router.get("/quiz-progress", ...auth, ctrl.quizProgress);  // ← BARU
router.get("/me", ...auth, ctrl.myRecommendations);

module.exports = router;
