"use strict";
const path = require("path");
const fs   = require("fs");
const { error } = require("console");

function makePublicUrl(folder, filename) {
  const base = process.env.APP_URL || `http://localhost:${process.env.PORT || 4000}`;
  return `${base}/uploads/${folder}/${filename}`;
}

function deleteOldFile(folder, filename) {
  if (!filename) return;
  try {
    const filePath = path.join(process.cwd(), "public", "uploads", folder, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    console.error(error);
  }
}

exports.uploadContent = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Tidak ada file yang diunggah" });
  }

  const url = makePublicUrl("contents", req.file.filename);

  return res.status(201).json({
    success:       true,
    message:       "File berhasil diunggah",
    url,                               // URL lengkap untuk disimpan di database
    relative_url:  `/uploads/contents/${req.file.filename}`,
    filename:      req.file.filename,
    original_name: req.file.originalname,
    size:          req.file.size,
    mimetype:      req.file.mimetype,
  });
};

exports.uploadThumbnail = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Tidak ada file yang diunggah" });
  }

  const url = makePublicUrl("thumbnails", req.file.filename);

  return res.status(201).json({
    success:       true,
    message:       "Thumbnail berhasil diunggah",
    url,
    relative_url:  `/uploads/thumbnails/${req.file.filename}`,
    filename:      req.file.filename,
    original_name: req.file.originalname,
    size:          req.file.size,
    mimetype:      req.file.mimetype,
  });
};

exports.deleteContent = (req, res) => {
  const { filename } = req.params;
  if (!filename || filename.includes("..") || filename.includes("/")) {
    return res.status(400).json({ success: false, message: "Nama file tidak valid" });
  }
  deleteOldFile("contents", filename);
  return res.json({ success: true, message: "File dihapus" });
};

exports.deleteThumbnail = (req, res) => {
  const { filename } = req.params;
  if (!filename || filename.includes("..") || filename.includes("/")) {
    return res.status(400).json({ success: false, message: "Nama file tidak valid" });
  }
  deleteOldFile("thumbnails", filename);
  return res.json({ success: true, message: "Thumbnail dihapus" });
};
