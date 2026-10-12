const { AppError } = require("../utils");

const LABD_CHAT_URL = "https://agent.thedevlabs.io/v1/api/chat";

// The endpoint is a single chat turn: it takes `messages` and replies with prose.
// There is no structured-output parameter, so the JSON shape we want has to be
// asked for in the prompt and then validated on the way back - never assumed.
const SYSTEM_PROMPT = [
  "You are a resume reviewer.",
  "You are given the text of a candidate's resume and the text of a job description.",
  "Score how well the resume matches the job description from 0 to 100, where 100 means",
  "the resume already demonstrates every requirement the job description asks for.",
  "Reply with one JSON object and nothing else: no markdown fence, no commentary.",
  'It must have exactly these keys: {"score": <integer 0-100>, "summary": "<two or three sentences>", "skillsPresent": ["<skill the job asks for that the resume shows>"], "skillsMissing": ["<skill the job asks for that the resume does not show>"], "fixes": ["<exactly three specific, actionable improvements, most important first>"]}',
  'If the resume text is empty or unreadable, use score 0 and explain that in "summary".',
].join(" ");

const REQUEST_TIMEOUT_MS = 25000;
const MAX_RESUME_CHARS = 15000;
const MAX_JOB_DESCRIPTION_CHARS = 8000;

function truncate(text, limit) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}\n\n[...truncated]`;
}

function messageForStatus(status) {
  switch (status) {
    case 401:
      return "The AI service rejected our API key. Check LABD_API_KEY.";
    case 402:
      return "The AI allowance for this project is used up.";
    case 403:
      return "The AI service is switched off for this project.";
    case 429:
      return "The AI service is rate limiting us. Try again in a minute.";
    default:
      return "The AI service is unavailable right now.";
  }
}

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

// The reply is prose that should contain JSON. Models like to wrap it in a
// ```json fence or add a sentence before it, so find the outermost object
// rather than trusting that the whole string parses.
function parseAnalysis(content) {
  const text = String(content ?? "")
    .replace(/```(?:json)?/gi, "")
    .trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new AppError("The AI service did not return a readable analysis.", 502);
  }

  let parsed;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new AppError("The AI service did not return a readable analysis.", 502);
  }

  const score = Number(parsed.score);
  const fixes = asStringArray(parsed.fixes).slice(0, 3);

  if (!Number.isFinite(score) || fixes.length === 0) {
    throw new AppError("The AI service did not return a readable analysis.", 502);
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    summary: typeof parsed.summary === "string" ? parsed.summary.trim() : "",
    skillsPresent: asStringArray(parsed.skillsPresent),
    skillsMissing: asStringArray(parsed.skillsMissing),
    fixes,
  };
}

async function analyseResume({ resumeText, jobDescription }) {
  const apiKey = process.env.LABD_API_KEY;
  if (!apiKey) {
    throw new AppError("The AI service is not configured.", 503);
  }

  let response;
  try {
    response = await fetch(LABD_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: [
              SYSTEM_PROMPT,
              "",
              "Job description:",
              truncate(jobDescription.trim(), MAX_JOB_DESCRIPTION_CHARS),
              "",
              "Resume:",
              truncate(resumeText, MAX_RESUME_CHARS),
            ].join("\n"),
          },
        ],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new AppError("Could not reach the AI service.", 503);
  }

  if (!response.ok) {
    // The response body is not echoed back: it can repeat the request, and the
    // key travels in the header of that same request.
    throw new AppError(messageForStatus(response.status), 503);
  }

  const body = await response.json().catch(() => null);
  const content = body?.message?.content;
  if (typeof content !== "string") {
    throw new AppError("The AI service did not return a readable analysis.", 502);
  }

  return parseAnalysis(content);
}

module.exports = { analyseResume, parseAnalysis };
