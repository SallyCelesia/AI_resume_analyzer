const Comparison = require("../models/comparison.model");

async function createComparison({ resume, jobDescription }) {
  const comparison = await Comparison.create({
    jobDescription: jobDescription.trim(),
    resume: {
      fileName: resume.originalname,
      mimeType: resume.mimetype,
      size: resume.size,
      data: resume.buffer,
    },
  });

  return comparison;
}

module.exports = { createComparison };
