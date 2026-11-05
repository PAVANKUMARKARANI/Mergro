import mongoose from "mongoose";

const Schema = mongoose.Schema;

/** Timeline kinds (names match the app's TimelineKind enum). */
export const EVENT_KINDS = ["captured", "call", "message", "crmSync", "viewing", "handoff", "consent"];

/**
 * One entry on a lead's activity timeline (app screen 19), and the audit
 * trail of what happened to the lead and who did it.
 */
const LeadEventSchema = new Schema({
  leadId: { type: Schema.ObjectId, ref: "Lead", required: true, index: true },
  brokerageId: { type: Schema.ObjectId, ref: "Brokerage", required: true },
  kind: { type: String, enum: EVENT_KINDS, required: true },
  title: { type: String, required: true },
  detail: String,
  actorId: { type: Schema.ObjectId, ref: "Employees" }, // null for system / webhook
  at: { type: Date, default: Date.now, index: true },
});

export default mongoose.model("LeadEvent", LeadEventSchema);
