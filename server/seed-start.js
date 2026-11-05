// npm run seed: creates the settings, roles, email templates and demo accounts the Mergro
// app needs. Safe to re-run: it only inserts what is missing and never overwrites data.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

if (!process.env.MONGO_HOST) {
  throw new Error("MONGO_HOST must be set in server/.env (see .env.example)");
}
process.env.NODE_ENV = process.env.NODE_ENV || "development";

require("babel-register");
require("babel-polyfill");
require("./server/seed/seed")
  .default()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
  });
