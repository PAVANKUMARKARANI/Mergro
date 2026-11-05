import Joi from "joi";
import Brokerage from "../models/brokerage.model";
import Employee from "../models/employee.model";
import LeadEvent from "../models/leadEvent.model";
import respUtil from "../utils/resp.util";
import { ingestLead } from "../services/leadIngest.service";
import { checkEligibility } from "../services/leadRules.service";
import {
  findVisibleLead,
  leadSummary,
  leadTimeline,
  listLeads,
  toAppJson,
} from "../services/leadQuery.service";

const MESSAGE_CHANNELS = ["sms", "whatsapp", "email"];
const CHANNEL_LABELS = { call: "Calls", sms: "SMS", whatsapp: "WhatsApp", email: "Email" };

/** Template error shape: HTTP 200, { errorCode: "9001", errorMessage }. */
const fail = (req, res, message) => {
  req.errorMessage = message;
  return res.json(respUtil.getErrorResponse(req));
};

/** The signed-in employee, fresh from the database. */
const currentEmployee = (req) => Employee.findById(req.tokenInfo._id);

/** Display name of [employee] for evidence lines. */
const nameOf = (employee) => employee.name || employee.email;

/**
 * Loads the employee and the lead in `req.params.leadId` they may see, or
 * answers with an error and returns null. Leads outside their scope are
 * "not found" so their existence isn't revealed.
 */
async function loadLead(req, res) {
  const employee = await currentEmployee(req);
  if (!employee || !employee.brokerageId) {
    fail(req, res, "Your account isn't linked to a brokerage.");
    return null;
  }
  const lead = await findVisibleLead(employee, req.params.leadId);
  if (!lead) {
    res.status(404).json({ errorCode: "404", errorMessage: "This lead no longer exists." });
    return null;
  }
  return { employee, lead };
}

/** Adds a timeline event by [employee]. */
const addEvent = (lead, employee, kind, title, detail) =>
  LeadEvent.create({ leadId: lead._id, brokerageId: lead.brokerageId, kind, title, detail, actorId: employee._id });

/** POST /api/leads/ingest (webhook; `req.brokerage` from the ingestion key). */
async function ingest(req, res) {
  const result = await ingestLead(req.brokerage, req.body);
  if (result.error) return res.status(400).json({ errorCode: "400", errorMessage: result.error });
  const { lead, duplicate, eligibility } = result;
  return res.status(duplicate ? 200 : 201).json({
    respCode: duplicate ? 200 : 201,
    respMessage: duplicate ? "Merged into an existing lead." : "Lead captured.",
    details: { leadId: lead._id, status: lead.status, duplicate, eligibility },
  });
}

/** GET /api/leads */
async function list(req, res) {
  const employee = await currentEmployee(req);
  if (!employee || !employee.brokerageId) return fail(req, res, "Your account isn't linked to a brokerage.");
  const result = await listLeads(employee, req.query);
  if (result.error) return fail(req, res, result.error);
  return res.json({ respCode: 200, details: result });
}

/** GET /api/leads/summary */
async function summary(req, res) {
  const employee = await currentEmployee(req);
  if (!employee || !employee.brokerageId) return fail(req, res, "Your account isn't linked to a brokerage.");
  const brokerage = await Brokerage.findById(employee.brokerageId);
  return res.json({ respCode: 200, details: await leadSummary(employee, brokerage) });
}

/** GET /api/leads/:leadId */
async function get(req, res) {
  const loaded = await loadLead(req, res);
  if (!loaded) return undefined;
  return res.json({ respCode: 200, details: toAppJson(loaded.lead) });
}

/** GET /api/leads/:leadId/timeline */
async function timeline(req, res) {
  const loaded = await loadLead(req, res);
  if (!loaded) return undefined;
  return res.json({ respCode: 200, details: { events: await leadTimeline(loaded.lead._id) } });
}

const consentSchema = Joi.object({
  channel: Joi.string().valid(...Object.keys(CHANNEL_LABELS)).required(),
  granted: Joi.boolean().valid(false).required().messages({
    "any.only": "Only the lead can give consent; you can record a withdrawal.",
  }),
});

/** PUT /api/leads/:leadId/consent { channel, granted: false } */
async function withdrawConsent(req, res) {
  const parsed = consentSchema.validate(req.body || {});
  if (parsed.error) return fail(req, res, parsed.error.details[0].message);
  const loaded = await loadLead(req, res);
  if (!loaded) return undefined;
  const { employee, lead } = loaded;
  const consent = lead.consents.find((c) => c.channel === parsed.value.channel);
  if (consent && consent.isGranted) {
    consent.isGranted = false;
    consent.evidence = `Withdrawn, recorded by ${nameOf(employee)}`;
    consent.recordedAt = new Date();
    lead.updated = new Date();
    await lead.save();
    await addEvent(lead, employee, "consent", `${CHANNEL_LABELS[consent.channel]} consent withdrawn`, `Recorded by ${nameOf(employee)}`);
  }
  return res.json({ respCode: 200, respMessage: "Consent withdrawn.", details: toAppJson(lead) });
}

/** POST /api/leads/:leadId/suppress — do not contact, on every channel. */
async function suppress(req, res) {
  const loaded = await loadLead(req, res);
  if (!loaded) return undefined;
  const { employee, lead } = loaded;
  if (lead.status !== "suppressed") {
    const now = new Date();
    lead.consents.forEach((c) => {
      c.isGranted = false;
      c.evidence = `Do-not-contact set by ${nameOf(employee)}`;
      c.recordedAt = now;
    });
    lead.status = "suppressed";
    lead.lastActivity = "Marked do-not-contact";
    lead.updated = now;
    await lead.save();
    await addEvent(lead, employee, "consent", "Marked do-not-contact", `All channels stopped by ${nameOf(employee)}`);
  }
  return res.json({ respCode: 200, respMessage: "Lead suppressed.", details: toAppJson(lead) });
}

/** POST /api/leads/:leadId/call-back — recorded only until the dialler exists. */
async function callBack(req, res) {
  const loaded = await loadLead(req, res);
  if (!loaded) return undefined;
  const { employee, lead } = loaded;
  const brokerage = await Brokerage.findById(lead.brokerageId);
  const eligibility = checkEligibility(lead, brokerage);
  if (eligibility.reason === "suppressed" || eligibility.reason === "noCallConsent") {
    return fail(req, res, "This lead hasn't agreed to calls.");
  }
  // TODO(voice-ai): enqueue the AI call; for now the request is only recorded.
  await addEvent(lead, employee, "call", "AI call-back requested", `By ${nameOf(employee)} · calling starts with the telephony integration`);
  return res.status(202).json({ respCode: 202, respMessage: "Call-back recorded.", details: { eligibility } });
}

const messageSchema = Joi.object({
  channel: Joi.string().valid(...MESSAGE_CHANNELS).required(),
  text: Joi.string().trim().min(1).max(500).required(),
});

/** POST /api/leads/:leadId/messages { channel, text } — recorded only. */
async function message(req, res) {
  const parsed = messageSchema.validate(req.body || {});
  if (parsed.error) return fail(req, res, parsed.error.details[0].message);
  const loaded = await loadLead(req, res);
  if (!loaded) return undefined;
  const { employee, lead } = loaded;
  const { channel, text } = parsed.value;
  const consent = lead.consents.find((c) => c.channel === channel);
  if (lead.status === "suppressed" || !consent || !consent.isGranted) {
    return fail(req, res, `This lead hasn't agreed to ${CHANNEL_LABELS[channel]}.`);
  }
  // TODO(messaging): send through the SMS / WhatsApp / email connector.
  await addEvent(lead, employee, "message", `${CHANNEL_LABELS[channel]} queued`, text);
  return res.status(202).json({ respCode: 202, respMessage: "Message recorded." });
}

export default { ingest, list, summary, get, timeline, withdrawConsent, suppress, callBack, message };
