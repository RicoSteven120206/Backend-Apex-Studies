const jwt = require("jsonwebtoken");
require("dotenv").config();
const { User } = require("../models/mysqlModel");

const extractToken = (req) => {
    const authHeader = req.headers["authorization"] || "";
    return authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
};

exports.verifyToken = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token is required (Tidak ada token)",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan di database",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error verifying token:", error.message);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired (Token kadaluarsa)",
            });
        }

        return res.status(403).json({
            success: false,
            message: "Invalid token (Token tidak valid)",
            error: error.message
        });
    }
};

exports.optionalAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findByPk(decoded.id);
        } else {
            req.user = null; 
        }
    } catch (error) {
        req.user = null;
    }
    next();
};

exports.adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Akses ditolak: Membutuhkan hak akses Admin",
        });
    }
    next();
};

exports.checkUserActive = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
    }

    if (req.user.is_active === false || req.user.is_active === 0) {
        return res.status(403).json({
            success: false,
            message: "Account is inactive (Akun tidak aktif)",
        });
    }

    next();
};