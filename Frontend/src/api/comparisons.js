// Public path prefix the backend is mounted under. The Vercel project rewrites
// /api/* to the backend service, and the Vite dev server proxies it to
// localhost:5000, so this holds in both places. VITE_API_URL stays as an escape
// hatch for pointing at a backend on a different origin.
const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export async function createComparison(resume, jobDescription) {
  const formData = new FormData();
  formData.append("resume", resume);
  formData.append("jobDescription", jobDescription);

  let response;
  try {
    response = await fetch(`${API_URL}/comparisons`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("Could not reach the backend. Check that the server is running.");
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    // A missing message is itself the signal: a crashed function or a routing
    // miss answers with a non-JSON page, so the status is the only clue left.
    throw new Error(
      body?.message ??
        `The comparison could not be submitted (HTTP ${response.status}).`,
    );
  }
  if (!body?.comparison) {
    throw new Error("The backend returned an invalid comparison response.");
  }

  return body;
}
