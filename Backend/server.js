require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
const connectDatabase = require("./config/database");

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  await connectDatabase();
  const server = app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received; closing server`);
    server.close(async (error) => {
      if (error) {
        console.error("Failed to close the HTTP server:", error);
        process.exitCode = 1;
      }
      await mongoose.disconnect();
      process.exit();
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error) => {
  console.error("Failed to start the backend:", error);
  process.exitCode = 1;
});
