const express = require("express");
const multer = require("multer");
const comparisonController = require("../controller/comparison.controller");
const { AppError } = require("../utils");
const validateComparisonRequest = require("../middleware/comparison.middleware");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
    fields: 1,
    fieldSize: 30 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype !== "application/pdf" ||
      !file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      callback(new AppError("Resume must be a PDF file.", 400));
      return;
    }
    callback(null, true);
  },
});

router.post(
  "/",
  upload.single("resume"),
  validateComparisonRequest,
  comparisonController.createComparison,
);

module.exports = router;
