const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const comparisonRoutes = require("./routes/comparison.routes");
const { errorHandler, notFoundHandler } = require("./middleware/error.middleware");

const app = express();
// The frontend and backend share one origin in production: one Vercel project,
// with /api/* rewritten to the backend service, so the browser's requests are
// same-origin and CORS does not apply. Local development is the only case that
// needs an allowed origin, because the Vite dev server runs on its own port.
// That is Vite's default, so nothing has to be set; FRONTEND_ORIGIN overrides it
// if Vite is ever moved to a different port.
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? "ok" : "unavailable",
    database: databaseReady ? "connected" : "disconnected",
  });
});

app.use("/api/comparisons", comparisonRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
