import ApiStats from "../models/api.stats.model";

/** Field names whose values must never be stored in apistats. */
const SENSITIVE = /^(password|newPassword|confirmPassword|currentPassword|token|accessToken|refreshToken|idToken|otp|salt)$/i;

/** Copy of a body/query object with sensitive values replaced by "[REDACTED]". */
function redact(value, depth = 0) {
  if (!value || typeof value !== "object" || depth > 5) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  const out = {};
  Object.keys(value).forEach((key) => {
    out[key] = SENSITIVE.test(key) ? "[REDACTED]" : redact(value[key], depth + 1);
  });
  return out;
}

/** Removes token values from a URL's query string. */
const redactUrl = (url) => (url ? url.replace(/([?&](?:token|accessToken|refreshToken)=)[^&]*/gi, "$1[REDACTED]") : url);

export default async function(req,res,next){
    /**@host is deprecated from express */
    let { originalUrl, query, url, ip, method, path, body, hostname, protocol, secure,params } = req;
    let apiStats = new ApiStats({originalUrl: redactUrl(originalUrl), url: redactUrl(url), ip, method, path, secure, host:hostname, protocol});
    if(body) apiStats.body = redact(body);
    if(query) apiStats.query = redact(query);
    if(params) apiStats.params = params;

    /**@savingApiStats (without blocking) */
    ApiStats.saveData(apiStats);
    next();
}
