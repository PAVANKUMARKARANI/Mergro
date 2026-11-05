import express from "express";
import asyncHandler from "express-async-handler";
import authPolicy from "../middlewares/authenticate";
import requireEmployee from "../middlewares/requireEmployee";
import { hashIngestKey, newIngestKey } from "../middlewares/ingestKey";
import Brokerage from "../models/brokerage.model";
import Employee from "../models/employee.model";
import respUtil from "../utils/resp.util";

const router = express.Router(); // eslint-disable-line new-cap

router.use(asyncHandler(authPolicy.isAllowed), requireEmployee);

/** The admin's brokerage, or an error response (returns null). */
async function adminBrokerage(req, res) {
  const employee = await Employee.findById(req.tokenInfo._id);
  if (!employee || employee.role !== "brokerageAdmin" || !employee.brokerageId) {
    req.errorMessage = "Only brokerage admins can manage the ingestion key.";
    res.json(respUtil.getErrorResponse(req));
    return null;
  }
  return Brokerage.findById(employee.brokerageId);
}

/** GET /api/brokerage/ingest-key - whether a key exists, and its prefix */
router.get("/ingest-key", asyncHandler(async (req, res) => {
  const brokerage = await adminBrokerage(req, res);
  if (!brokerage) return undefined;
  return res.json({
    respCode: 200,
    details: {
      hasKey: Boolean(brokerage.ingestKeyHash),
      prefix: brokerage.ingestKeyPrefix || null,
      createdAt: brokerage.ingestKeyCreatedAt || null,
    },
  });
}));

/**
 * POST /api/brokerage/ingest-key - creates or rotates the key. The plain key
 * is returned once; only its hash is stored, and the old key stops working.
 */
router.post("/ingest-key", asyncHandler(async (req, res) => {
  const brokerage = await adminBrokerage(req, res);
  if (!brokerage) return undefined;
  const key = newIngestKey();
  brokerage.ingestKeyHash = hashIngestKey(key);
  brokerage.ingestKeyPrefix = key.slice(0, 8);
  brokerage.ingestKeyCreatedAt = new Date();
  await brokerage.save();
  return res.json({
    respCode: 200,
    respMessage: "Copy this key now; it won't be shown again.",
    details: { key, prefix: brokerage.ingestKeyPrefix, header: "x-mergro-key" },
  });
}));

module.exports = router;
