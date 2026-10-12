const mongoose = require("mongoose");

const comparisonSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      required: true,
    },
    analysis: {
      score: { type: Number, min: 0, max: 100, default: null },
      summary: { type: String, default: "" },
      skillsPresent: { type: [String], default: [] },
      skillsMissing: { type: [String], default: [] },
      fixes: { type: [String], default: [] },
    },
    jobDescription: {
      type: String,
      required: true,
      maxlength: 20000,
    },
    resume: {
      fileName: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
      data: { type: Buffer, required: true, select: false },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Comparison", comparisonSchema);
