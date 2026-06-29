"use strict";
const router = require("express").Router();
const ctrl   = require("../controllers/quizController");
const { verifyToken, adminOnly, checkUserActive } = require("../middlewares/authMiddleware");

const auth       = [verifyToken, checkUserActive];
const adminGuard = [verifyToken, adminOnly];

// ── User ──
router.get("/my-attempts",                      ...auth, ctrl.myAttempts);
router.get("/:quizId",                          ...auth, ctrl.getQuizForUser);
router.post("/:quizId/start",                   ...auth, ctrl.startAttempt);
router.post("/attempt/:attemptId/submit",       ...auth, ctrl.submitAttempt);
router.get("/attempt/:attemptId/result",        ...auth, ctrl.getAttemptResult);

// ── Admin ──
router.get("/admin/list",                       ...adminGuard, ctrl.adminQuizList);
router.get("/admin/:quizId",                    ...adminGuard, ctrl.adminQuizDetail);
router.get("/admin/:quizId/stats",              ...adminGuard, ctrl.quizStats);
router.post("/admin",                           ...adminGuard, ctrl.createQuiz);
router.post("/admin/:quizId/questions",         ...adminGuard, ctrl.addQuestion);
router.post("/admin/question/:questionId/options", ...adminGuard, ctrl.addOption);
router.put("/admin/:quizId",                    ...adminGuard, ctrl.updateQuiz);
router.put("/admin/question/:questionId",       ...adminGuard, ctrl.updateQuestion);
router.put("/admin/option/:optionId",           ...adminGuard, ctrl.updateOption);
router.delete("/admin/:quizId",                 ...adminGuard, ctrl.deleteQuiz);
router.delete("/admin/question/:questionId",    ...adminGuard, ctrl.deleteQuestion);

module.exports = router;
