import Brokerage from "../models/brokerage.model";
import OnboardingProgress from "../models/onboardingProgress.model";
import { stepsFor } from "./onboardingSteps";

/** Returns the employee's brokerage, creating and linking one when missing (caller saves employee). */
export const ensureBrokerage = async (employee) => {
  if (employee.brokerageId) {
    const existing = await Brokerage.findById(employee.brokerageId);
    if (existing) return existing;
  }
  const brokerage = await Brokerage.create({ ownerId: employee._id });
  employee.brokerageId = brokerage._id;
  return brokerage;
};

/** Returns the employee's progress document, creating it on first use. */
export const findOrCreateProgress = async (employee) => {
  const progress = await OnboardingProgress.findOne({ employeeId: employee._id });
  if (progress) return progress;
  return OnboardingProgress.create({ employeeId: employee._id, role: employee.role, drafts: {} });
};

/**
 * Writes a validated step's data to the brokerage (admin steps) or the employee (personal
 * steps). Saves the brokerage; the caller saves the employee.
 */
export const applyStep = async (employee, stepId, data) => {
  const adminFields = {
    crmLeadSources: () => ({ leadSources: data.enabledLeadSources }),
    viewingCalendar: () => ({ viewingCalendar: data }),
    phoneLine: () => ({ phoneLine: data }),
    aiAgent: () => ({ aiAgent: Object.assign({}, data, { disclosesAi: true }) }),
    brokerageProfile: () => ({
      name: data.brokerageName,
      country: data.country,
      timeZone: data.timeZone,
      officeAddress: data.officeAddress,
      opensAt: data.opensAt,
      closesAt: data.closesAt,
    }),
  };
  if (adminFields[stepId]) {
    const brokerage = await ensureBrokerage(employee);
    brokerage.set(adminFields[stepId]());
    brokerage.updated = new Date();
    await brokerage.save();
    return;
  }
  if (stepId === "agentProfile") {
    employee.name = data.fullName;
    employee.phone = data.mobileNumber;
    employee.languages = data.languages;
  } else if (stepId === "hotLeadAlerts") {
    employee.alertPreferences = data;
  } else if (stepId === "agentCalendar") {
    employee.availability = data;
  }
  // inviteTeam has nothing to store: invites are created by POST /api/team/invites.
};

/** The progress payload the app reads (GET /api/onboarding and step responses). */
export const progressView = (employee, progress) => ({
  role: employee.role,
  steps: stepsFor(employee.role),
  completedSteps: progress ? progress.completedSteps : [],
  skippedSteps: progress ? progress.skippedSteps : [],
  drafts: progress && progress.drafts ? progress.drafts : {},
  onboardingCompleted: Boolean(employee.onboardingCompleted),
});

/** The signed-in user as the app sees it (GET /api/auth/me). Never includes secrets. */
export const publicUser = async (employee) => {
  let brokerageName = "";
  if (employee.brokerageId) {
    const brokerage = await Brokerage.findById(employee.brokerageId, "name");
    if (brokerage && brokerage.name) brokerageName = brokerage.name;
  }
  return {
    _id: employee._id,
    name: employee.name || "",
    email: employee.email,
    role: employee.role,
    phone: employee.phone || "",
    status: employee.status,
    languages: employee.languages || [],
    brokerageId: employee.brokerageId || null,
    brokerageName: brokerageName,
    onboardingCompleted: Boolean(employee.onboardingCompleted),
  };
};
