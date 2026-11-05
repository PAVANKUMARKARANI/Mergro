import mongoose from "mongoose";

const Schema = mongoose.Schema;

/**
 * One document per employee: which onboarding steps are done or skipped, and the last saved
 * draft of each step so the app can resume where the user left off.
 */
const OnboardingProgressSchema = new Schema(
  {
    employeeId: { type: Schema.ObjectId, ref: "Employees", required: true, unique: true },
    role: String,
    completedSteps: [String],
    skippedSteps: [String],
    drafts: { type: Schema.Types.Mixed, default: {} },
    completedAt: Date,
    created: { type: Date, default: Date.now },
    updated: Date,
  },
  { minimize: false }
);

export default mongoose.model("OnboardingProgress", OnboardingProgressSchema);
