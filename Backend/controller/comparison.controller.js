const comparisonService = require("../service/comparison.service");
const { asyncHandler } = require("../utils");

exports.createComparison = asyncHandler(async (req, res) => {
  const comparison = await comparisonService.createComparison({
    resume: req.file,
    jobDescription: req.body.jobDescription,
  });

  res.status(201).json({
    message: "Resume and job description saved; AI comparison is not active yet.",
    comparison: {
      id: comparison.id,
      status: comparison.status,
      resume: {
        fileName: comparison.resume.fileName,
        size: comparison.resume.size,
      },
      jobDescriptionLength: comparison.jobDescription.length,
      createdAt: comparison.createdAt,
    },
  });
});
