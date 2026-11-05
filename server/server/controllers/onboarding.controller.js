import Employee from "../models/employee.model";
import Brokerage from "../models/brokerage.model";
import OnboardingProgress from "../models/onboardingProgress.model";
import respUtil from "../utils/resp.util";
import { OPTIONAL_STEPS, stepsFor, validateStep } from "../services/onboardingSteps";
import {
  applyStep,
  findOrCreateProgress,
  progressView,
} from "../services/onboarding.service";

/** Sends the template's error shape: HTTP 200, { errorCode: "9001", errorMessage }. */
const fail = (req, res, message) => {
  req.errorMessage = message;
  return res.json(respUtil.getErrorResponse(req));
};

/** Loads the signed-in employee fresh from the database. */
const currentEmployee = (req) => Employee.findById(req.tokenInfo._id);

/** Adds an item to a string array once. */
const addOnce = (list, item) => (list.indexOf(item) === -1 ? list.concat(item) : list);

/** GET /api/onboarding: role, step list, completed/skipped steps and saved drafts. */
async function getProgress(req, res) {
  const employee = await currentEmployee(req);
  if (!employee) return fail(req, res, "Account not found.");
  const progress = await OnboardingProgress.findOne({ employeeId: employee._id });
  return res.json({ respCode: 200, details: progressView(employee, progress) });
}

/**
 * PUT /api/onboarding/steps/:stepId
 * Body { data: {...} } saves a step; body { skipped: true } skips an optional step.
 */
async function saveStep(req, res) {
  const stepId = req.params.stepId;
  const employee = await currentEmployee(req);
  if (!employee) return fail(req, res, "Account not found.");
  if (employee.onboardingCompleted) return fail(req, res, "Onboarding is already complete.");
  if (stepsFor(employee.role).indexOf(stepId) === -1) {
    return fail(req, res, `"${stepId}" is not an onboarding step for your role.`);
  }

  const progress = await findOrCreateProgress(employee);
  if (req.body && req.body.skipped === true) {
    if (OPTIONAL_STEPS.indexOf(stepId) === -1) return fail(req, res, "This step can't be skipped.");
    progress.skippedSteps = addOnce(progress.skippedSteps, stepId);
    progress.completedSteps = progress.completedSteps.filter((s) => s !== stepId);
  } else {
    const result = validateStep(stepId, req.body ? req.body.data : undefined);
    if (result.error) return fail(req, res, result.error);
    await applyStep(employee, stepId, result.value);
    employee.updated = new Date();
    await employee.save();
    progress.drafts = Object.assign({}, progress.drafts, { [stepId]: result.value });
    progress.markModified("drafts");
    progress.completedSteps = addOnce(progress.completedSteps, stepId);
    progress.skippedSteps = progress.skippedSteps.filter((s) => s !== stepId);
  }
  progress.role = employee.role;
  progress.updated = new Date();
  await progress.save();
  return res.json({
    respCode: 205,
    respMessage: "Step saved.",
    details: progressView(employee, progress),
  });
}

/** POST /api/onboarding/complete: requires every non-optional step; activates the brokerage for admins. */
async function complete(req, res) {
  const employee = await currentEmployee(req);
  if (!employee) return fail(req, res, "Account not found.");
  if (employee.onboardingCompleted) {
    return res.json({ respCode: 200, respMessage: "Onboarding complete.", details: progressView(employee, null) });
  }
  const progress = await findOrCreateProgress(employee);
  const missing = stepsFor(employee.role).filter(
    (s) => OPTIONAL_STEPS.indexOf(s) === -1 && progress.completedSteps.indexOf(s) === -1
  );
  if (missing.length) return fail(req, res, `Finish these steps first: ${missing.join(", ")}.`);

  if (employee.role === "brokerageAdmin") {
    const brokerage = employee.brokerageId ? await Brokerage.findById(employee.brokerageId) : null;
    if (!brokerage) return fail(req, res, "Save your brokerage profile first.");
    brokerage.status = "Active";
    brokerage.updated = new Date();
    await brokerage.save();
  }
  employee.onboardingCompleted = true;
  employee.updated = new Date();
  await employee.save();
  progress.completedAt = new Date();
  progress.updated = new Date();
  await progress.save();
  return res.json({
    respCode: 200,
    respMessage: "Onboarding complete.",
    details: progressView(employee, progress),
  });
}

export default { getProgress, saveStep, complete };
