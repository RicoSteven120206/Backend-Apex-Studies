"use strict";
const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

const ALLOWED = {
  content: {
    extensions: new Set([
      ".mp4", ".mkv", ".avi", ".mov", ".webm",   
      ".pdf",                                     
      ".doc", ".docx",                             
      ".ppt", ".pptx",                             
      ".txt",                                      
    ]),
    maxSize: 500 * 1024 * 1024, // 500 MB
    folder:  "contents",
  },
  thumbnail: {
    extensions: new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]),
    maxSize:    10 * 1024 * 1024, // 10 MB
    folder:     "thumbnails",
  },
};

function makeUploader(category) {
  const cfg = ALLOWED[category];

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), "public", "uploads", cfg.folder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext    = path.extname(file.originalname).toLowerCase();
      const base   = path.basename(file.originalname, ext)
                         .replace(/[^a-zA-Z0-9_\-]/g, "_")
                         .substring(0, 50);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${base}_${unique}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!ext || !cfg.extensions.has(ext)) {
      return cb(
        new Error(
          `Format file tidak didukung: "${ext || 'tanpa ekstensi'}". ` +
          `Format yang diterima: ${[...cfg.extensions].join(", ")}`
        )
      );
    }

    cb(null, true); 
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: cfg.maxSize },
  });
}

exports.uploadContent   = makeUploader("content").single("file");
exports.uploadThumbnail = makeUploader("thumbnail").single("file");

exports.handleUploadError = (err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Ukuran file terlalu besar. Periksa batas maksimum.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err instanceof Error) {
    return res.status(400).json({
      success: false,
      message: err.message, 
    });
  }

  next(err);
};