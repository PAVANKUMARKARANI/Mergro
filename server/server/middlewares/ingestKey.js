import crypto from "crypto";
import rateLimit from "express-rate-limit";
import Brokerage from "../models/brokerage.model";

/** Header lead sources send the brokerage's ingestion key in. */
export const INGEST_KEY_HEADER = "x-mergro-key";

/** sha256 of an ingestion key (only the hash is stored). */
export const hashIngestKey = (key) => crypto.createHash("sha256").update(String(key)).digest("hex");

/** A new random key: "mgk_" + 40 hex characters. */
export const newIngestKey = () => `mgk_${crypto.randomBytes(20).toString("hex")}`;

/**
 * Authenticates a lead source by its brokerage ingestion key and sets
 * `req.brokerage`. Answers 401 for a missing or unknown key.
 */
export async function requireIngestKey(req, res, next) {
  const key = req.get(INGEST_KEY_HEADER);
  const brokerage = key
    ? await Brokerage.findOne({ ingestKeyHash: hashIngestKey(key), active: true })
    : null;
  if (!brokerage) {
    return res.status(401).json({ errorCode: "401", errorMessage: "Invalid or missing ingestion key." });
  }
  req.brokerage = brokerage;
  return next();
}

/** At most 120 enquiries a minute per key (or per IP without one). */
export const ingestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.get(INGEST_KEY_HEADER) ? hashIngestKey(req.get(INGEST_KEY_HEADER)) : req.ip),
  message: { errorCode: "429", errorMessage: "Too many enquiries; slow down and retry." },
});
