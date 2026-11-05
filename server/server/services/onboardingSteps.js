import Joi from "joi";

/**
 * Onboarding steps per role. Must match OnboardingStepId.stepsFor() in the mobile app
 * (lib/features/onboarding/models/onboarding_flow_models.dart).
 */
const AGENT_ESSENTIALS = ["agentProfile", "hotLeadAlerts"];
export const STEPS_BY_ROLE = {
  brokerageAdmin: [
    "brokerageProfile",
    "crmLeadSources",
    "viewingCalendar",
    "phoneLine",
    "aiAgent",
    "inviteTeam",
  ],
  salesAgent: ["agentProfile", "hotLeadAlerts", "agentCalendar"],
  teamLead: AGENT_ESSENTIALS,
  operations: AGENT_ESSENTIALS,
  complianceReviewer: AGENT_ESSENTIALS,
};
export const ROLES = Object.keys(STEPS_BY_ROLE);
export const OPTIONAL_STEPS = ["viewingCalendar", "inviteTeam", "agentCalendar"];

/** Steps for a role; unknown roles get none. */
export const stepsFor = (role) => STEPS_BY_ROLE[role] || [];

const time = Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:mm");
const phone = Joi.string().trim().pattern(/^\+?[0-9 ()-]{7,20}$/, "phone number");
const languages = Joi.array().items(Joi.string().trim().min(1).max(40)).min(1).max(20).unique();

/** Rejects a range whose start is not strictly before its end ("HH:mm" compares as text). */
const startBeforeEnd = (start, end) => (value, helpers) =>
  value[start] < value[end] ? value : helpers.message(`"${start}" must be before "${end}"`);

const calendar = Joi.object({
  viewingMinutes: Joi.number().integer().min(5).max(480).required(),
  bufferMinutes: Joi.number().integer().min(0).max(240).required(),
  days: Joi.array().items(Joi.number().integer().min(1).max(7)).min(1).unique().required(),
  startTime: time.required(),
  endTime: time.required(),
}).custom(startBeforeEnd("startTime", "endTime"));

/** Request body schema of `PUT /api/onboarding/steps/:stepId` → `data`, per step. */
export const STEP_SCHEMAS = {
  brokerageProfile: Joi.object({
    brokerageName: Joi.string().trim().min(1).max(120).required(),
    country: Joi.string().valid("india", "unitedStates").required(),
    timeZone: Joi.string().trim().min(1).max(64).required(),
    officeAddress: Joi.string().trim().allow("").max(300).default(""),
    opensAt: time.required(),
    closesAt: time.required(),
  }).custom(startBeforeEnd("opensAt", "closesAt")),
  crmLeadSources: Joi.object({
    enabledLeadSources: Joi.array().items(Joi.string().trim().max(60)).max(30).unique().default([]),
  }),
  viewingCalendar: calendar,
  phoneLine: Joi.object({
    provider: Joi.string().valid("twilio", "exotel").required(),
    numberSource: Joi.string().valid("newNumber", "existing").required(),
    number: phone.required(),
    consentConfirmed: Joi.boolean().valid(true).required(),
  }),
  aiAgent: Joi.object({
    agentName: Joi.string().trim().min(1).max(60).required(),
    voice: Joi.string().valid("warmFemale", "calmMale", "brightFemale").required(),
    languages: languages.required(),
  }),
  // Invites are sent through POST /api/team/invites; this step only records completion.
  inviteTeam: Joi.object({}),
  agentProfile: Joi.object({
    fullName: Joi.string().trim().min(1).max(120).required(),
    mobileNumber: phone.required(),
    languages: languages.required(),
  }),
  hotLeadAlerts: Joi.object({
    pushEnabled: Joi.boolean().required(),
    smsFallbackEnabled: Joi.boolean().required(),
    soundEnabled: Joi.boolean().required(),
    quietStart: time.required(),
    quietEnd: time.required(),
  }),
  agentCalendar: calendar,
};

/**
 * Validates a step's data. Returns { value } (normalised) or { error } (a readable message).
 */
export const validateStep = (stepId, data) => {
  const schema = STEP_SCHEMAS[stepId];
  if (!schema) return { error: `Unknown onboarding step "${stepId}".` };
  const result = schema.validate(data || {}, { abortEarly: true, stripUnknown: true });
  if (result.error) return { error: result.error.details[0].message };
  return { value: result.value };
};
