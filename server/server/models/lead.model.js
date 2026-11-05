import mongoose from "mongoose";

const Schema = mongoose.Schema;

/** Lead sources (names match the app's LeadSource enum). */
export const LEAD_SOURCES = ["website", "facebook", "googleAds", "acres99", "magicBricks", "housing"];

/** Pipeline statuses (names match the app's LeadStatus enum). */
export const LEAD_STATUSES = [
  "newLead",
  "calling",
  "qualified",
  "viewingBooked",
  "withAgent",
  "nurturing",
  "suppressed",
];

/** Contact channels that need consent (names match the app's ConsentChannel). */
export const CONSENT_CHANNELS = ["call", "sms", "whatsapp", "email"];

const ConsentSchema = new Schema(
  {
    channel: { type: String, enum: CONSENT_CHANNELS, required: true },
    isGranted: { type: Boolean, default: false },
    evidence: String, // e.g. "99acres enquiry form" or "Withdrawn, recorded by Priya"
    recordedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * A prospective buyer or tenant of one brokerage. Captured by the ingestion
 * webhook; qualification, score and reasons are filled in by the AI call
 * (Voice AI phase) — the seed fills them for demo leads.
 */
const LeadSchema = new Schema(
  {
    brokerageId: { type: Schema.ObjectId, ref: "Brokerage", required: true, index: true },
    name: { type: String, trim: true, required: true },
    phone: { type: String, required: true }, // E.164, e.g. +919845012210
    email: { type: String, lowercase: true, trim: true },
    source: { type: String, enum: LEAD_SOURCES, required: true },
    sourceRef: String, // the source's own id, for dedupe and support
    area: String,
    budget: String,
    propertyType: String,
    status: { type: String, enum: LEAD_STATUSES, default: "newLead", index: true },
    score: { type: Number, min: 1, max: 100 },
    ownerId: { type: Schema.ObjectId, ref: "Employees", index: true },
    lastActivity: String,
    consents: [ConsentSchema],
    qualification: [
      {
        _id: false,
        key: String, // budget | area | timeline | propertyType | preApproval
        value: String,
        confidence: Number,
      },
    ],
    scoreReasons: [{ _id: false, code: String, label: String, points: Number }],
    /** Eligibility verdict at capture: ok | outsideCallingHours | noCallConsent | suppressed. */
    eligibility: { reason: String, nextWindowAt: Date },
    active: { type: Boolean, default: true },
    created: { type: Date, default: Date.now, index: true },
    updated: Date,
  },
  { usePushEach: true }
);

LeadSchema.index({ brokerageId: 1, phone: 1 });
LeadSchema.index({ brokerageId: 1, email: 1 });

export default mongoose.model("Lead", LeadSchema);
