const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const comparisonRoutes = require("./routes/comparison.routes");
const { errorHandler, notFoundHandler } = require("./middleware/error.middleware");

const app = express();
// Local development only: the browser loads the Vite dev server on its own port,
// so that origin has to be allowed explicitly. In production the frontend and
// backend share one origin and CORS does not apply.



app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN }));
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
