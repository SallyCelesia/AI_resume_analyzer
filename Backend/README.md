# Backend

Express API and MongoDB persistence for the resume comparison frontend. The API
stores submitted PDFs and job descriptions with a `pending` status; scoring and
skill matching are intentionally left for the future AI integration.

## Setup

1. Install a local MongoDB server or create a MongoDB Atlas database.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to your connection URI.
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

Successful submissions return HTTP `201` with a comparison ID and `pending`
status. The original PDF is stored as a MongoDB binary field and is excluded
from normal model queries. Keep the database credentials private and use an
access-controlled database in production.

`GET /api/health` reports server and MongoDB readiness.
