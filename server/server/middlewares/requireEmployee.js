import respUtil from "../utils/resp.util";

/**
 * Run after authPolicy.isAllowed. isAllowed lets requests without a token through when
 * config.isTokenNotPassed is false, so Mergro endpoints that need a signed-in employee use
 * this guard as well.
 */
export default function requireEmployee(req, res, next) {
  if (!req.tokenInfo || !req.tokenInfo._id || req.tokenInfo.loginType !== "employee") {
    req.i18nKey = "sessionExperied";
    return res.status(401).json(respUtil.getErrorResponse(req));
  }
  return next();
}
