import moment from "moment-timezone";

/** Default calling window when the brokerage has not set office hours. */
const DEFAULT_HOURS = { opensAt: "09:00", closesAt: "19:00" };
const DEFAULT_ZONE = { india: "Asia/Kolkata", unitedStates: "America/New_York" };
const COUNTRY_CODE = { india: "91", unitedStates: "1" };

/**
 * Normalizes [raw] to E.164 ("+919845012210") for the brokerage [country]
 * (app enum name). Returns null when it can't be a valid mobile number.
 */
export function normalizePhone(raw, country = "india") {
  if (typeof raw !== "string") return null;
  const hasPlus = raw.trim().startsWith("+");
  let digits = raw.replace(/\D/g, "");
  if (!hasPlus) {
    const code = COUNTRY_CODE[country] || "91";
    digits = digits.replace(/^0+/, "");
    if (digits.length === 10) digits = code + digits;
  }
  return digits.length >= 11 && digits.length <= 15 ? `+${digits}` : null;
}

/** IANA zone from the stored label ("Asia/Kolkata (IST, UTC+5:30)"). */
export function zoneOf(brokerage) {
  const label = brokerage && brokerage.timeZone ? brokerage.timeZone.split(" ")[0] : "";
  if (label && moment.tz.zone(label)) return label;
  return DEFAULT_ZONE[brokerage && brokerage.country] || DEFAULT_ZONE.india;
}

/** Minutes since midnight of "HH:mm". */
const minutesOf = (hhmm) => {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Whether the AI may call [lead] at [now], and if not, why and when the
 * next calling window opens. Reasons: ok | suppressed | noCallConsent |
 * outsideCallingHours.
 */
export function checkEligibility(lead, brokerage, now = new Date()) {
  if (lead.status === "suppressed") return { eligible: false, reason: "suppressed" };
  const call = (lead.consents || []).find((c) => c.channel === "call");
  if (!call || !call.isGranted) return { eligible: false, reason: "noCallConsent" };

  const zone = zoneOf(brokerage);
  const opensAt = (brokerage && brokerage.opensAt) || DEFAULT_HOURS.opensAt;
  const closesAt = (brokerage && brokerage.closesAt) || DEFAULT_HOURS.closesAt;
  const local = moment.tz(now, zone);
  const minute = local.hours() * 60 + local.minutes();
  if (minute >= minutesOf(opensAt) && minute < minutesOf(closesAt)) {
    return { eligible: true, reason: "ok" };
  }
  const [openHour, openMinute] = opensAt.split(":").map(Number);
  const next = local.clone().set({ hour: openHour, minute: openMinute, second: 0, millisecond: 0 });
  if (minute >= minutesOf(opensAt)) next.add(1, "day");
  return { eligible: false, reason: "outsideCallingHours", nextWindowAt: next.toDate() };
}

/** Hot / Warm / Cold band of a 1–100 score (same thresholds as the app). */
export const temperatureOf = (score) =>
  typeof score !== "number" ? null : score >= 75 ? "hot" : score >= 45 ? "warm" : "cold";

/** Score range per band, for list filters. */
export const SCORE_RANGES = { hot: [75, 100], warm: [45, 74], cold: [1, 44] };
