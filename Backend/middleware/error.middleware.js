const multer = require("multer");
const { AppError } = require("../utils");

function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Resume must be 10 MB or smaller."
        : "Upload must contain one PDF resume and one job description.";
    res.status(400).json({ message });
    return;
  }

  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    console.error(error);
  }
  res.status(statusCode).json({
    message:
      statusCode >= 500 ? "An unexpected server error occurred." : error.message,
  });
}

module.exports = { errorHandler, notFoundHandler };
