"use strict";
const router = require("express").Router();
const ctrl   = require("../controllers/uploadController");
const {
  uploadContent,
  uploadThumbnail,
  handleUploadError,
} = require("../middlewares/upload");
const { verifyToken, adminOnly } = require("../middlewares//authMiddleware");

const adminGuard = [verifyToken, adminOnly];

router.post(
  "/content",
  ...adminGuard,
  (req, res, next) => {
    uploadContent(req, res, (err) => {
      if (err) return handleUploadError(err, req, res, next);
      next();
    });
  },
  ctrl.uploadContent
);

router.post(
  "/thumbnail",
  ...adminGuard,
  (req, res, next) => {
    uploadThumbnail(req, res, (err) => {
      if (err) return handleUploadError(err, req, res, next);
      next();
    });
  },
  ctrl.uploadThumbnail
);

router.delete("/content/:filename",   ...adminGuard, ctrl.deleteContent);
router.delete("/thumbnail/:filename", ...adminGuard, ctrl.deleteThumbnail);

module.exports = router;
