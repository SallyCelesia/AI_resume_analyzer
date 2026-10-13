const Comparison = require("../models/comparison.model");
const { extractResumeText } = require("./resume.service");
const { analyseResume } = require("./labd.service");

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

  // Read the PDF, then ask labd to score it against the job description. The row
  // is saved before either step runs, so a submission that fails part-way is
  // still on record as "failed" instead of disappearing.
  let resumeText;
  try {
    resumeText = await extractResumeText(resume.buffer);
  } catch (error) {
    comparison.status = "failed";
    await comparison.save().catch(() => {});
    throw error;
  }

  try {
    comparison.analysis = await analyseResume({
      resumeText,
      jobDescription: comparison.jobDescription,
    });
    comparison.status = "completed";
  } catch (error) {
    comparison.status = "failed";
    await comparison.save().catch(() => {});
    throw error;
  }

  await comparison.save();
  return comparison;
}

module.exports = { createComparison };
