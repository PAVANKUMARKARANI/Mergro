import express from "express";
import asyncHandler from "express-async-handler";
import authPolicy from "../middlewares/authenticate";
import requireEmployee from "../middlewares/requireEmployee";
import { ingestLimiter, requireIngestKey } from "../middlewares/ingestKey";
import leadCtrl from "../controllers/lead.controller";

const router = express.Router(); // eslint-disable-line new-cap

/** POST /api/leads/ingest - lead sources (header x-mergro-key), not app users */
router.post("/ingest", ingestLimiter, asyncHandler(requireIngestKey), asyncHandler(leadCtrl.ingest));

// Everything below is for signed-in app users.
router.use(asyncHandler(authPolicy.isAllowed), requireEmployee);

/** GET /api/leads - search / filter / page (agents: own + unassigned) */
router.route("/").get(asyncHandler(leadCtrl.list));

/** GET /api/leads/summary - today's dashboard counts */
router.route("/summary").get(asyncHandler(leadCtrl.summary));

/** GET /api/leads/:leadId - profile, consent, qualification, score reasons */
router.route("/:leadId").get(asyncHandler(leadCtrl.get));

/** GET /api/leads/:leadId/timeline - activity, newest first */
router.route("/:leadId/timeline").get(asyncHandler(leadCtrl.timeline));

/** PUT /api/leads/:leadId/consent - { channel, granted: false } */
router.route("/:leadId/consent").put(asyncHandler(leadCtrl.withdrawConsent));

/** POST /api/leads/:leadId/suppress - do not contact */
router.route("/:leadId/suppress").post(asyncHandler(leadCtrl.suppress));

/** POST /api/leads/:leadId/call-back - recorded until the dialler exists */
router.route("/:leadId/call-back").post(asyncHandler(leadCtrl.callBack));

/** POST /api/leads/:leadId/messages - { channel, text }, recorded until messaging exists */
router.route("/:leadId/messages").post(asyncHandler(leadCtrl.message));

module.exports = router;
