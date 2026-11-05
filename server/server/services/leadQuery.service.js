import Joi from "joi";
import moment from "moment-timezone";
import mongoose from "mongoose";
import Lead, { LEAD_SOURCES, LEAD_STATUSES } from "../models/lead.model";
import LeadEvent from "../models/leadEvent.model";
import { SCORE_RANGES, zoneOf } from "./leadRules.service";

/** Roles limited to their own and unassigned leads. */
const OWN_LEADS_ROLES = ["salesAgent"];
const QUALIFIED = ["qualified", "viewingBooked", "withAgent"];

/** "+919845012210" → "+91 98450 12210" (other numbers unchanged). */
export const formatPhone = (phone) => {
  const india = /^\+91(\d{5})(\d{5})$/.exec(phone || "");
  return india ? `+91 ${india[1]} ${india[2]}` : phone;
};

/** Mongo filter of the leads [employee] may see. */
export function visibleTo(employee) {
  const filter = { brokerageId: employee.brokerageId, active: true };
  if (OWN_LEADS_ROLES.includes(employee.role)) {
    filter.$or = [{ ownerId: employee._id }, { ownerId: null }];
  }
  return filter;
}

/** The lead as the app's `Lead` / profile JSON. */
export function toAppJson(lead) {
  const owner = lead.ownerId && lead.ownerId.name ? lead.ownerId.name : null;
  return {
    _id: lead._id,
    name: lead.name,
    phone: formatPhone(lead.phone),
    email: lead.email || null,
    source: lead.source,
    status: lead.status,
    area: lead.area || "",
    budget: lead.budget || "",
    propertyType: lead.propertyType || "",
    createdAt: lead.created,
    lastActivity: lead.lastActivity || "",
    score: typeof lead.score === "number" ? lead.score : null,
    ownerName: owner,
    consents: (lead.consents || []).map((c) => ({
      channel: c.channel,
      isGranted: c.isGranted,
      evidence: c.evidence,
      recordedAt: c.recordedAt,
    })),
    qualification: lead.qualification || [],
    scoreReasons: lead.scoreReasons || [],
  };
}

const csv = (allowed) =>
  Joi.string().custom((value, helpers) => {
    const items = value.split(",").map((s) => s.trim()).filter(Boolean);
    return items.every((item) => allowed.includes(item)) ? items : helpers.error("any.invalid");
  });

/** Query string of GET /api/leads. */
const listSchema = Joi.object({
  q: Joi.string().trim().max(80).allow(""),
  temperature: csv(Object.keys(SCORE_RANGES)),
  source: csv(LEAD_SOURCES),
  status: csv(LEAD_STATUSES),
  area: Joi.string().trim().max(400),
  days: Joi.number().integer().min(1).max(365),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

/** Escapes text for use inside a RegExp. */
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Leads [employee] may see, newest first, filtered by [query]. Returns
 * { error } or { items, total, page, limit }.
 */
export async function listLeads(employee, query, now = new Date()) {
  const parsed = listSchema.validate(query || {}, { stripUnknown: true });
  if (parsed.error) return { error: parsed.error.details[0].message };
  const q = parsed.value;
  const and = [visibleTo(employee)];
  if (q.q) {
    const digits = q.q.replace(/\D/g, "");
    const pattern = new RegExp(escape(q.q), "i");
    const or = [{ name: pattern }, { area: pattern }];
    if (digits.length >= 3) or.push({ phone: new RegExp(digits) });
    and.push({ $or: or });
  }
  if (q.temperature) {
    and.push({ $or: q.temperature.map((band) => ({ score: { $gte: SCORE_RANGES[band][0], $lte: SCORE_RANGES[band][1] } })) });
  }
  if (q.source) and.push({ source: { $in: q.source } });
  if (q.status) and.push({ status: { $in: q.status } });
  if (q.area) and.push({ area: { $in: q.area.split(",").map((s) => s.trim()) } });
  if (q.days) and.push({ created: { $gte: new Date(now.getTime() - q.days * 86400000) } });
  const filter = { $and: and };
  const [items, total] = await Promise.all([
    Lead.find(filter)
      .sort({ created: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .populate("ownerId", "name"),
    Lead.countDocuments(filter),
  ]);
  return { items: items.map(toAppJson), total, page: q.page, limit: q.limit };
}

/** One lead [employee] may see, or null (unknown id or not theirs). */
export async function findVisibleLead(employee, leadId) {
  if (!mongoose.Types.ObjectId.isValid(leadId)) return null;
  return Lead.findOne({ ...visibleTo(employee), _id: leadId }).populate("ownerId", "name");
}

/** Today's dashboard counts in the brokerage's time zone. */
export async function leadSummary(employee, brokerage, now = new Date()) {
  const start = moment.tz(now, zoneOf(brokerage)).startOf("day").toDate();
  const today = await Lead.find({ ...visibleTo(employee), created: { $gte: start } }, "status score");
  const reached = today.filter((lead) => typeof lead.score === "number").length;
  return {
    newLeadsToday: today.length,
    qualifiedToday: today.filter((lead) => QUALIFIED.includes(lead.status)).length,
    contactRatePercent: today.length ? Math.round((reached * 100) / today.length) : 0,
    // Needs call records (Voice AI phase).
    speedToLeadSeconds: null,
  };
}

/** A lead's timeline, newest first, as the app's TimelineEvent JSON. */
export async function leadTimeline(leadId) {
  const events = await LeadEvent.find({ leadId }).sort({ at: -1 }).limit(200);
  return events.map((e) => ({ at: e.at, kind: e.kind, title: e.title, detail: e.detail || null }));
}
