const mongoose = require("mongoose");

async function connectDatabase() {
  const { MONGODB_URI: mongoUri } = process.env;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required to start the backend.");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
}

module.exports = connectDatabase;
