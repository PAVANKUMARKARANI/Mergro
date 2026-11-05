import mongoose from "mongoose";

const Schema = mongoose.Schema;

/**
 * A brokerage (workspace). Created by the admin's first onboarding step and filled in by the
 * remaining admin steps. Integration connection state (Zoho, calendars, phone OTP) is not
 * stored here yet: those flows are still simulated in the app.
 */
const BrokerageSchema = new Schema(
  {
    name: { type: String, trim: true },
    country: String, // app enum name: india | unitedStates
    timeZone: String,
    officeAddress: String,
    opensAt: String, // HH:mm
    closesAt: String, // HH:mm
    leadSources: [String],
    viewingCalendar: {
      viewingMinutes: Number,
      bufferMinutes: Number,
      days: [Number], // 1 = Monday … 7 = Sunday
      startTime: String,
      endTime: String,
    },
    phoneLine: {
      provider: String, // twilio | exotel
      numberSource: String, // newNumber | existing
      number: String,
      consentConfirmed: Boolean,
    },
    aiAgent: {
      agentName: String,
      voice: String, // warmFemale | calmMale | brightFemale
      languages: [String],
      disclosesAi: { type: Boolean, default: true },
    },
    status: { type: String, default: "Setup" }, // Setup | Active
    /** sha256 of the lead-ingestion API key; the plain key is shown once. */
    ingestKeyHash: { type: String, index: true },
    /** First characters of the key, so admins can tell keys apart. */
    ingestKeyPrefix: String,
    ingestKeyCreatedAt: Date,
    ownerId: { type: Schema.ObjectId, ref: "Employees" },
    active: { type: Boolean, default: true },
    created: { type: Date, default: Date.now },
    updated: Date,
  },
  { usePushEach: true }
);

export default mongoose.model("Brokerage", BrokerageSchema);
