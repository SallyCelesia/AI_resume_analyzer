const comparisonService = require("../service/comparison.service");
const { asyncHandler } = require("../utils");

exports.createComparison = asyncHandler(async (req, res) => {
  const comparison = await comparisonService.createComparison({
    resume: req.file,
    jobDescription: req.body.jobDescription,
  });

  res.status(201).json({
    message: "Resume analysed against the job description.",
    comparison: {
      id: comparison.id,
      status: comparison.status,
      resume: {
        fileName: comparison.resume.fileName,
        size: comparison.resume.size,
      },
      jobDescriptionLength: comparison.jobDescription.length,
      createdAt: comparison.createdAt,
      analysis: {
        score: comparison.analysis?.score ?? null,
        summary: comparison.analysis?.summary ?? "",
        skillsPresent: comparison.analysis?.skillsPresent ?? [],
        skillsMissing: comparison.analysis?.skillsMissing ?? [],
        fixes: comparison.analysis?.fixes ?? [],
      },
    },
  });
});
