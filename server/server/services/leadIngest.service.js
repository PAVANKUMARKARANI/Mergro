import Joi from "joi";
import Lead, { CONSENT_CHANNELS, LEAD_SOURCES } from "../models/lead.model";
import LeadEvent from "../models/leadEvent.model";
import { checkEligibility, normalizePhone } from "./leadRules.service";

/** Display names of the sources (match the app). */
export const SOURCE_LABELS = {
  website: "Website form",
  facebook: "Facebook Lead Ads",
  googleAds: "Google Ads",
  acres99: "99acres",
  magicBricks: "MagicBricks",
  housing: "Housing.com",
};

/** How far back a repeat enquiry merges into the same lead. */
const DEDUPE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const text = (max) => Joi.string().trim().max(max);

/**
 * Webhook body of POST /api/leads/ingest. Call consent must be explicit;
 * other channels default to not granted.
 */
const ingestSchema = Joi.object({
  name: text(120).min(1).required(),
  phone: text(30).required(),
  email: Joi.string().trim().lowercase().email().max(200),
  source: Joi.string().valid(...LEAD_SOURCES).required(),
  sourceRef: text(120),
  area: text(120),
  budget: text(60),
  propertyType: text(80),
  consent: Joi.object({
    call: Joi.boolean().required(),
    sms: Joi.boolean().default(false),
    whatsapp: Joi.boolean().default(false),
    email: Joi.boolean().default(false),
  }).required(),
  consentText: text(200),
});

/** Last-activity text for an eligibility verdict. */
const ACTIVITY = {
  ok: "Ready for the AI call",
  outsideCallingHours: "Waiting for calling hours",
  noCallConsent: "No call consent: messaging only",
  suppressed: "Opted out: not contacted",
};

/**
 * Validates and stores one enquiry for [brokerage]. Returns
 * { error } or { lead, duplicate, eligibility }.
 */
export async function ingestLead(brokerage, body, now = new Date()) {
  const parsed = ingestSchema.validate(body || {}, { stripUnknown: true });
  if (parsed.error) return { error: parsed.error.details[0].message };
  const input = parsed.value;
  const phone = normalizePhone(input.phone, brokerage.country);
  if (!phone) return { error: '"phone" is not a valid mobile number' };

  const evidence = input.consentText || `${SOURCE_LABELS[input.source]} enquiry form`;
  const since = new Date(now.getTime() - DEDUPE_WINDOW_MS);
  const match = [{ phone }];
  if (input.email) match.push({ email: input.email });
  const existing = await Lead.findOne({
    brokerageId: brokerage._id,
    active: true,
    created: { $gte: since },
    $or: match,
  });

  if (existing) {
    return mergeEnquiry(existing, brokerage, input, evidence, now);
  }

  const lead = new Lead({
    brokerageId: brokerage._id,
    name: input.name,
    phone,
    email: input.email,
    source: input.source,
    sourceRef: input.sourceRef,
    area: input.area,
    budget: input.budget,
    propertyType: input.propertyType,
    consents: CONSENT_CHANNELS.map((channel) => ({
      channel,
      isGranted: input.consent[channel] === true,
      evidence: input.consent[channel] === true ? evidence : "Not given on the form",
      recordedAt: now,
    })),
    created: now,
  });
  const eligibility = checkEligibility(lead, brokerage, now);
  lead.eligibility = { reason: eligibility.reason, nextWindowAt: eligibility.nextWindowAt };
  lead.lastActivity = ACTIVITY[eligibility.reason];
  await lead.save();
  await LeadEvent.create({
    leadId: lead._id,
    brokerageId: brokerage._id,
    kind: "captured",
    title: `Lead captured · ${SOURCE_LABELS[input.source]}`,
    detail: [input.propertyType, input.budget].filter(Boolean).join(" · ") || undefined,
    at: now,
  });
  return { lead, duplicate: false, eligibility };
}

/**
 * A repeat enquiry: fills empty fields and adds newly granted consent —
 * except for suppressed leads, which stay suppressed.
 */
async function mergeEnquiry(lead, brokerage, input, evidence, now) {
  const isSuppressed = lead.status === "suppressed";
  for (const field of ["email", "area", "budget", "propertyType"]) {
    if (!lead[field] && input[field]) lead[field] = input[field];
  }
  if (!isSuppressed) {
    lead.consents.forEach((consent) => {
      if (!consent.isGranted && input.consent[consent.channel] === true) {
        consent.isGranted = true;
        consent.evidence = evidence;
        consent.recordedAt = now;
      }
    });
  }
  const eligibility = checkEligibility(lead, brokerage, now);
  lead.updated = now;
  await lead.save();
  await LeadEvent.create({
    leadId: lead._id,
    brokerageId: brokerage._id,
    kind: "captured",
    title: `Enquired again · ${SOURCE_LABELS[input.source]}`,
    detail: isSuppressed ? "Opted out earlier: not contacted" : "Merged into this lead",
    at: now,
  });
  return { lead, duplicate: true, eligibility };
}
