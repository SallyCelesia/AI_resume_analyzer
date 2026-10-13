# Backend

Express API and MongoDB persistence for the resume comparison frontend. A
submission is stored, its PDF is read to text, and that text is scored against
the job description by labd: a score out of 100, the skills the job asks for
that the resume shows and misses, and the top 3 fixes.

## Setup

1. Install a local MongoDB server or create a MongoDB Atlas database.
2. Copy `.env.example` to `.env`, set `MONGODB_URI` to your connection URI, and
   set `LABD_API_KEY` to a key made at learn.thedevlabs.io/settings#api-keys.
   The key stays on the server: never send it to the browser.
3. Run `npm install` and `npm run dev` from this directory.
4. Run the frontend in a second terminal with `npm run dev` from `Frontend/`.

The API listens on port `5000` by default. The Vite development server proxies
`/api` requests to it, and its default origin (`http://localhost:5173`) is the
one CORS allows. Set `FRONTEND_ORIGIN` only if Vite is moved to another port.
In production there is nothing to configure: the frontend and backend are two
services of one Vercel project, so the browser's requests are same-origin.

## API

`POST /api/comparisons` accepts `multipart/form-data` with:

- `resume`: one PDF file (maximum 10 MB)
- `jobDescription`: non-empty text (maximum 20,000 characters)

Successful submissions return HTTP `201` with the comparison ID, `completed`
status, and the `analysis` object (`score`, `summary`, `skillsPresent`,
`skillsMissing`, `fixes`). The original PDF is stored as a MongoDB binary field
and is excluded from normal model queries. Keep the database credentials private
and use an access-controlled database in production.

The analysis runs inside the request, so the browser waits for labd to answer -
up to 25 seconds on a long resume. If the key is missing, wrong, or out of
allowance, the submission is still stored, with `failed` status, and the error
is returned using the service's own message (401, 402, 403, 429).

`GET /api/health` reports server and MongoDB readiness.
