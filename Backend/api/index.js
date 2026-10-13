// Serverless entry point for Vercel.
//
// server.js calls app.listen(), which Vercel functions cannot do - the platform
// invokes a handler per request instead of giving it a port to hold open. This
// file exports the same Express app, with no listener, so @vercel/node can
// drive it. Local development still uses `node server.js` unchanged.

let app;
let connectDatabase;
let startupError;

// This block runs once per cold start, before any request is handled. If
// anything in the require chain throws - a dependency that cannot load, a bad
// environment - Node fails the invocation before Express exists, and the
// browser gets a plain 500 with no JSON body, which is a status and nothing
// else. Loading the app in here, inside try/catch, turns that into a message.
try {
  app = require("../app");
  connectDatabase = require("../config/database");
} catch (error) {
  startupError = error;
  console.error("Failed to load the application:", error);
}

// Vercel keeps a warm function instance alive between requests, so connect once
// and cache the promise. Calling mongoose.connect on every request would open a
// new pool each time and exhaust the Atlas connection limit.
let connectionPromise;

function connection() {
  if (!connectionPromise) {
    connectionPromise = connectDatabase().catch((error) => {
      // Let the next request retry instead of caching a rejected promise.
      connectionPromise = undefined;
      throw error;
    });
  }
  return connectionPromise;
}

module.exports = async (req, res) => {
  if (startupError) {
    res.status(500).json({
      message: `The server failed to start: ${startupError.message}`,
    });
    return;
  }

  try {
    await connection();
  } catch (error) {
    // dotenv is only loaded by server.js, so on Vercel MONGODB_URI comes from
    // the project's environment variables. If it is missing there, connecting
    // fails before Express sees the request.
    console.error("Database connection failed:", error.message);
    res.status(503).json({
      message:
        "The server could not connect to the database. Check that MONGODB_URI is set in the deployment environment.",
    });
    return;
  }

  return app(req, res);
};
