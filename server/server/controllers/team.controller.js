import Joi from "joi";
import Employee from "../models/employee.model";
import config from "../config/config";
import respUtil from "../utils/resp.util";
import serviceUtil from "../utils/service.util";
import EmailService from "../services/email.service";
import { ROLES } from "../services/onboardingSteps";
import { INVITE_TOKEN_TTL_MS, issueResetToken } from "../services/resetToken.service";

const emailService = new EmailService();

const invitesSchema = Joi.object({
  invites: Joi.array()
    .items(
      Joi.object({
        email: Joi.string().trim().lowercase().email().required(),
        role: Joi.string().valid(...ROLES.filter((r) => r !== "brokerageAdmin")).required(),
      })
    )
    .min(1)
    .max(50)
    .unique("email")
    .required(),
});

/** Sends the template's error shape: HTTP 200, { errorCode: "9001", errorMessage }. */
const fail = (req, res, message) => {
  req.errorMessage = message;
  return res.json(respUtil.getErrorResponse(req));
};

/** Creates one invited employee and emails the set-password link. Returns the result row. */
async function inviteOne(admin, invite) {
  const existing = await Employee.findOne({ email: invite.email });
  if (existing) return { email: invite.email, status: "failed", reason: "This email already has an account." };

  const employee = new Employee({
    email: invite.email,
    role: invite.role,
    status: "Invited",
    brokerageId: admin.brokerageId,
    invitedBy: admin._id,
    created: new Date(),
  });
  const token = issueResetToken(employee, INVITE_TOKEN_TTL_MS);
  await employee.save();

  const enEmail = serviceUtil.encodeString(employee.email);
  // Delivery is best-effort: sendEmailviaGrid records the outcome in the emailstatuses collection.
  emailService
    .sendEmailviaGrid({
      templateName: config.emailTemplates.employeeWelcome,
      entityType: "employee",
      emailParams: {
        to: employee.email,
        displayName: employee.email,
        Id: employee._id,
        link: `${config.mailSettings.adminUrl}/changeRecoverPassword/${enEmail}?token=${token}`,
      },
    })
    .catch(() => {});
  return { email: invite.email, status: "invited" };
}

/** POST /api/team/invites { invites: [{ email, role }] }: brokerage admins only. */
async function sendInvites(req, res) {
  const admin = await Employee.findById(req.tokenInfo._id);
  if (!admin || admin.role !== "brokerageAdmin") return fail(req, res, "Only brokerage admins can invite people.");
  if (!admin.brokerageId) return fail(req, res, "Save your brokerage profile first.");

  const parsed = invitesSchema.validate(req.body || {}, { stripUnknown: true });
  if (parsed.error) return fail(req, res, parsed.error.details[0].message);

  const results = [];
  for (const invite of parsed.value.invites) {
    results.push(await inviteOne(admin, invite));
  }
  const sentCount = results.filter((r) => r.status === "invited").length;
  return res.json({
    respCode: 200,
    respMessage: `${sentCount} of ${results.length} invites sent.`,
    details: { sentCount: sentCount, results: results },
  });
}

export default { sendInvites };
