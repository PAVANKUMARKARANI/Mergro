const path = require("path");
// Secrets and connection strings live in server/.env (git-ignored). See .env.example.
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "sendgrid.env") });

process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.SERVER_PORT = process.env.SERVER_PORT || "2282";
process.env.MONGO_PORT = process.env.MONGO_PORT || "27017";

if (!process.env.MONGO_HOST || !process.env.JWTSECRET) {
  throw new Error("MONGO_HOST and JWTSECRET must be set in server/.env (see .env.example)");
}

require("babel-register");
require("babel-polyfill");
require("./server/db/mongo.db");
