import crypto from "crypto";

/**
 * Single-use password reset / invite tokens. Only a sha256 hash is stored on the employee;
 * the plain token goes in the emailed link and is checked by changeRecoverPassword.
 */
const hash = (token) => crypto.createHash("sha256").update(String(token)).digest("hex");

/** Creates a token, stores its hash and expiry on the employee (caller saves), returns it. */
export const issueResetToken = (employee, ttlMs) => {
  const token = crypto.randomBytes(32).toString("hex");
  employee.resetPasswordTokenHash = hash(token);
  employee.resetPasswordExpires = Date.now() + ttlMs;
  return token;
};

/** True when the token matches the stored hash and has not expired. */
export const verifyResetToken = (employee, token) => {
  if (!token || !employee.resetPasswordTokenHash || !employee.resetPasswordExpires) return false;
  if (employee.resetPasswordExpires < Date.now()) return false;
  const given = Buffer.from(hash(token), "hex");
  const stored = Buffer.from(employee.resetPasswordTokenHash, "hex");
  return given.length === stored.length && crypto.timingSafeEqual(given, stored);
};

/** Makes the token unusable (caller saves). */
export const clearResetToken = (employee) => {
  employee.resetPasswordTokenHash = undefined;
  employee.resetPasswordExpires = undefined;
};

export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // forgot password: 30 minutes
export const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // team invite: 7 days
