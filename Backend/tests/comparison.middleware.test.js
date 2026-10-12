const test = require("node:test");
const assert = require("node:assert/strict");
const validateComparisonRequest = require("../middleware/comparison.middleware");

function validate({ file, jobDescription }) {
  let error;
  validateComparisonRequest(
    {
      file,
      body: { jobDescription },
    },
    {},
    (nextError) => {
      error = nextError;
    },
  );
  return error;
}

test("accepts a PDF signature and a non-empty job description", () => {
  const error = validate({
    file: { buffer: Buffer.from("%PDF-1.7") },
    jobDescription: "Frontend engineer",
  });
  assert.equal(error, undefined);
});

test("rejects a missing resume", () => {
  assert.equal(validate({ jobDescription: "Frontend engineer" }).statusCode, 400);
});

test("rejects files without a PDF signature", () => {
  const error = validate({
    file: { buffer: Buffer.from("not a PDF") },
    jobDescription: "Frontend engineer",
  });
  assert.match(error.message, /valid PDF/);
});

test("rejects an empty job description", () => {
  const error = validate({
    file: { buffer: Buffer.from("%PDF-1.7") },
    jobDescription: "   ",
  });
  assert.match(error.message, /job description is required/i);
});
