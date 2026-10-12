const { PDFParse } = require("pdf-parse");
const { AppError } = require("../utils");

// PDFs are stored as a Buffer in memory (multer.memoryStorage), so pdf-parse v2
// is handed the bytes directly with `data`. In v1 this was `pdf(buffer)`; v2 is
// a class you construct, call, and then destroy to release the worker.
async function extractResumeText(buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const text = String(result?.text ?? "")
      .replace(/\r/g, "")
      .replace(/[ \t]+$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text) {
      throw new AppError(
        "No text could be read from this PDF. If it is a scan or an image, upload a text-based PDF instead.",
        422,
      );
    }

    return text;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("This PDF could not be read. Try re-exporting it.", 400);
  } finally {
    // destroy() releases pdf.js resources; a failure here must not mask the
    // real error, so it is swallowed.
    await parser.destroy().catch(() => {});
  }
}

module.exports = { extractResumeText };
