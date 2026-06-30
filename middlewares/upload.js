"use strict";
const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

/**
 * KENAPA HANYA CEK EKSTENSI?
 *
 * MIME type dari browser TIDAK konsisten:
 *   .docx → bisa dikirim sebagai application/zip, application/octet-stream,
 *            atau application/vnd.openxmlformats... tergantung OS & browser
 *   .pdf  → kadang application/octet-stream di browser tertentu
 *
 * Ekstensi file jauh lebih reliable → pakai itu sebagai satu-satunya validator.
 */
const ALLOWED = {
  content: {
    extensions: new Set([
      // Video
      ".mp4", ".mkv", ".avi", ".mov", ".webm",
      // Dokumen
      ".pdf", ".doc", ".docx",
      // Presentasi
      ".ppt", ".pptx",
      // Teks
      ".txt",
    ]),
    maxSize: 500 * 1024 * 1024,  // 500 MB
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
                         .replace(/[^a-zA-Z0-9_-]/g, "_")
                         .substring(0, 50);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${base}_${unique}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!ext || !cfg.extensions.has(ext)) {
      // ✅ Kirim sebagai Error biasa (bukan MulterError)
      // Ini yang ditangkap handleUploadError di bawah
      return cb(new Error(
        `Format "${ext || 'tanpa ekstensi'}" tidak didukung. ` +
        `Format yang diterima: ${[...cfg.extensions].join(", ")}`
      ), false);
    }

    cb(null, true);
  };

  return multer({ storage, fileFilter, limits: { fileSize: cfg.maxSize } });
}

exports.uploadContent   = makeUploader("content").single("file");
exports.uploadThumbnail = makeUploader("thumbnail").single("file");

/**
 * Error handler — HARUS dipasang tepat setelah multer middleware di route.
 *
 * Menangkap 2 jenis error:
 *   1. multer.MulterError → LIMIT_FILE_SIZE, dll
 *   2. Error biasa → dari fileFilter (format tidak didukung)
 */
exports.handleUploadError = (err, req, res, next) => {
  if (!err) return next();

  // Multer internal error (batas ukuran dll)
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Ukuran file melebihi batas maksimum yang diizinkan.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // Error dari fileFilter (instanceof Error — format tidak valid)
  if (err instanceof Error) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};
