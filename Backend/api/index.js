// Serverless entry point for Vercel.
//
// server.js calls app.listen(), which Vercel functions cannot do - the platform
// invokes a handler per request instead of giving it a port to hold open. This
// file exports the same Express app, with no listener, so @vercel/node can
// drive it. Local development still uses `node server.js` unchanged.
const app = require("../app");
const connectDatabase = require("../config/database");

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
  await connection();
  return app(req, res);
};

