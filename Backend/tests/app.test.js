const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const app = require("../app");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.closeAllConnections();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("health endpoint reports database readiness", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.deepEqual(body, {
    status: "unavailable",
    database: "disconnected",
  });
});

test("comparison endpoint rejects a missing resume", async () => {
  const response = await fetch(`${baseUrl}/api/comparisons`, {
    method: "POST",
    body: new FormData(),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.message, "A resume PDF is required.");
});

test("comparison endpoint rejects a file with an invalid PDF signature", async () => {
  const formData = new FormData();
  formData.append(
    "resume",
    new Blob(["not a PDF"], { type: "application/pdf" }),
    "resume.pdf",
  );
  formData.append("jobDescription", "Frontend engineer");

  const response = await fetch(`${baseUrl}/api/comparisons`, {
    method: "POST",
    body: formData,
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.message, "The uploaded file is not a valid PDF.");
});
