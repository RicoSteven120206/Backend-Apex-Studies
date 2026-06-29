"use strict";
const router = require("express").Router();
const ctrl = require("../controllers/userController");
const { verifyToken, adminOnly, checkUserActive } = require("../middlewares/authMiddleware");

// Publik
router.post("/register", ctrl.registerUser);
router.post("/login", ctrl.loginUser);

// User login
router.get("/me", verifyToken, checkUserActive, ctrl.getMe);

// Admin only — manage user
router.get("/", verifyToken, adminOnly, ctrl.getAllUsers);
router.post("/", verifyToken, adminOnly, ctrl.createUser);
router.put("/:id", verifyToken, adminOnly, ctrl.updateUser);
router.delete("/:id", verifyToken, adminOnly, ctrl.deleteUser);

module.exports = router;