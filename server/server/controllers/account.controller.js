import Employee from "../models/employee.model";
import respUtil from "../utils/resp.util";
import { publicUser } from "../services/onboarding.service";

/** GET /api/auth/me: the signed-in user, their brokerage name and onboarding state. */
async function me(req, res) {
  const employee = await Employee.findById(req.tokenInfo._id);
  if (!employee || employee.active === false || employee.status !== "Active") {
    req.i18nKey = "sessionExperied";
    return res.status(401).json(respUtil.getErrorResponse(req));
  }
  return res.json({ respCode: 200, details: await publicUser(employee) });
}

export default { me };
