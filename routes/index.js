"use strict";
const router = require("express").Router();

router.use("/users", require("./userRoutes"));        
router.use("/catalog", require("./catalogRoutes"));
router.use("/recommendations", require("./recommendationRoutes"));
router.use("/quiz", require("./quizRoutes"));          
router.use("/interactions", require("./userInteractionRoutes"));
router.use("/contents", require("./contentRoutes"));
router.use("/subjects", require("./subjectRoutes"));
router.use("/analytics", require("./analyticsRoutes"));
router.use("/learning-paths", require("./learningPathRoutes"));
router.use("/uploads", require("./uploadRoutes"));

module.exports = router;