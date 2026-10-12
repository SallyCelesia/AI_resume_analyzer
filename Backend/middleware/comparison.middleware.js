const { AppError } = require("../utils");

const MAX_JOB_DESCRIPTION_LENGTH = 20000;

function validateComparisonRequest(req, res, next) {
  if (!req.file) {
    next(new AppError("A resume PDF is required.", 400));
    return;
  }

  if (req.file.buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    next(new AppError("The uploaded file is not a valid PDF.", 400));
    return;
  }

  const jobDescription = req.body.jobDescription;
  if (typeof jobDescription !== "string" || !jobDescription.trim()) {
    next(new AppError("A job description is required.", 400));
    return;
  }
  if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
    next(
      new AppError(
        `Job description must be ${MAX_JOB_DESCRIPTION_LENGTH} characters or fewer.`,
        400,
      ),
    );
    return;
  }

  next();
}

module.exports = validateComparisonRequest;
