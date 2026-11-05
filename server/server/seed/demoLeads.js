import Lead from "../models/lead.model";
import LeadEvent from "../models/leadEvent.model";
import { SOURCE_LABELS } from "../services/leadIngest.service";
import { temperatureOf } from "../services/leadRules.service";

/** The app's demo leads (same people, sources and statuses). */
const LEADS = [
  ["Deepak Joshi", "+919845166023", "website", "calling", "Koramangala", "₹1 – 1.2 Cr", "3 BHK apartment", 1, null, false],
  ["Rohan Desai", "+919845012210", "acres99", "calling", "Whitefield", "₹85 L – 1 Cr", "3 BHK apartment", 2, null, false],
  ["Ananya Iyer", "+919900144871", "facebook", "withAgent", "Koramangala", "₹1.2 – 1.5 Cr", "3 BHK apartment", 18, 91, true],
  ["Vikram Shetty", "+919741130562", "website", "viewingBooked", "HSR Layout", "₹70 – 85 L", "2 BHK apartment", 42, 82, true],
  ["Fatima Sheikh", "+919886177310", "magicBricks", "qualified", "Indiranagar", "₹2 – 2.5 Cr", "Independent villa", 120, 77, false],
  ["Karthik Rao", "+919008061125", "googleAds", "nurturing", "Sarjapur Road", "₹60 – 75 L", "2 BHK apartment", 180, 58, false],
  ["Meera Nair", "+919632088410", "housing", "newLead", "Hebbal", "₹90 L – 1.1 Cr", "3 BHK apartment", 240, null, false],
  ["Arnav Gupta", "+919845523019", "acres99", "nurturing", "Whitefield", "₹50 – 60 L", "2 BHK apartment", 1560, 41, false],
  ["Sneha Kulkarni", "+919986054402", "website", "viewingBooked", "Koramangala", "₹1 – 1.3 Cr", "3 BHK apartment", 1800, 79, true],
  ["Imran Khan", "+919739011286", "facebook", "suppressed", "HSR Layout", "₹45 – 55 L", "1 BHK apartment", 2880, 22, false],
  ["Priyanka Reddy", "+919019077654", "magicBricks", "qualified", "Hebbal", "₹1.5 – 1.8 Cr", "Row house", 4320, 68, false],
  ["Aditya Menon", "+919880439917", "googleAds", "nurturing", "Indiranagar", "₹3 – 3.5 Cr", "Independent villa", 8640, 36, false],
  ["Lakshmi Pillai", "+919611520348", "housing", "withAgent", "Sarjapur Road", "₹75 – 90 L", "3 BHK apartment", 17280, 85, true],
];

const REASONS = {
  hot: [["BUDGET_FIT", "Budget fits homes in the area", 15], ["TIMELINE_SOON", "Wants to move within 90 days", 12], ["PRE_APPROVED", "Home loan pre-approved", 10]],
  warm: [["BUDGET_FIT", "Budget fits homes in the area", 10], ["TIMELINE_LATER", "Moving in 6–12 months", -5], ["NO_PRE_APPROVAL", "Loan not pre-approved yet", -4]],
  cold: [["BUDGET_LOW", "Budget below listings in the area", -10], ["TIMELINE_UNSURE", "No moving date yet", -8], ["LOW_ENGAGEMENT", "Short answers on the call", -6]],
};
const ANSWERS = { hot: ["Within 3 months", "Pre-approved", 0.9], warm: ["6–12 months", "Applying", 0.72], cold: ["Not sure yet", "Not started", 0.5] };
const ACTIVITY = {
  calling: "AI call in progress", withAgent: "Hot lead handed off", viewingBooked: "Viewing booked by the AI",
  qualified: "AI call · qualified", nurturing: "Follow-up journey · step 1", newLead: "Waiting for calling hours",
  suppressed: "Opted out on call",
};

/** Score reasons that add up to [score] from the base of 50. */
function reasonsFor(score) {
  const band = temperatureOf(score);
  const reasons = REASONS[band].map(([code, label, points]) => ({ code, label, points }));
  const rest = score - 50 - reasons.reduce((sum, r) => sum + r.points, 0);
  if (rest !== 0) reasons.push({ code: "OTHER_SIGNALS", label: "Other call signals", points: rest });
  return reasons;
}

/** The five answers for a scored lead. */
function qualificationFor(row, score) {
  const [timeline, preApproval, confidence] = ANSWERS[temperatureOf(score)];
  return [
    { key: "budget", value: row[5], confidence },
    { key: "area", value: row[4], confidence: 0.95 },
    { key: "timeline", value: timeline, confidence: confidence - 0.05 },
    { key: "propertyType", value: row[6], confidence: 0.9 },
    { key: "preApproval", value: preApproval, confidence: confidence - 0.1 },
  ];
}

/**
 * Inserts the demo leads and their timelines into [brokerage] when it has
 * none. [agent] owns the leads marked as assigned. Returns the count added.
 */
export default async function seedDemoLeads(brokerage, agent, now = new Date()) {
  if (await Lead.countDocuments({ brokerageId: brokerage._id })) return 0;
  for (const row of LEADS) {
    const [name, phone, source, status, area, budget, propertyType, minutesAgo, score, isOwned] = row;
    const created = new Date(now.getTime() - minutesAgo * 60000);
    const form = `${SOURCE_LABELS[source]} enquiry form`;
    const optedOut = status === "suppressed";
    const granted = (channel) => !optedOut && (channel === "call" || channel === "sms" ||
      (channel === "whatsapp" && ["facebook", "website", "googleAds"].includes(source)) ||
      (channel === "email" && ["website", "googleAds", "housing"].includes(source)));
    const lead = await Lead.create({
      brokerageId: brokerage._id, name, phone, source, area, budget, propertyType, status,
      email: `${name.toLowerCase().split(" ").join(".")}@gmail.com`,
      score: score || undefined,
      ownerId: isOwned && agent ? agent._id : undefined,
      lastActivity: ACTIVITY[status],
      consents: ["call", "sms", "whatsapp", "email"].map((channel) => ({
        channel, isGranted: granted(channel),
        evidence: optedOut ? "Opted out on the AI call" : granted(channel) ? form : "Not given on the form",
        recordedAt: created,
      })),
      qualification: score ? qualificationFor(row, score) : [],
      scoreReasons: score ? reasonsFor(score) : [],
      created,
    });
    const at = (seconds) => new Date(created.getTime() + seconds * 1000);
    const events = [{ kind: "captured", title: `Lead captured · ${SOURCE_LABELS[source]}`, detail: `${propertyType} · ${budget}`, at: created }];
    if (score) {
      events.push({ kind: "call", title: optedOut ? "AI call · opted out" : "AI call · qualified", detail: `Score ${score}`, at: at(45) });
      events.push({ kind: "crmSync", title: "Synced to Zoho CRM", detail: "Contact, score and call summary", at: at(360) });
    }
    if (optedOut) events.push({ kind: "consent", title: "Opted out on the AI call", detail: "All channels stopped", at: at(180) });
    if (status === "viewingBooked") events.push({ kind: "viewing", title: "Viewing booked by the AI", detail: "Confirmation sent by SMS", at: at(420) });
    if (status === "withAgent") events.push({ kind: "handoff", title: `Handed to ${agent ? agent.name : "an agent"}`, detail: "Hot lead · accepted within SLA", at: at(420) });
    await LeadEvent.insertMany(events.filter((e) => e.at <= now).map((e) => ({ ...e, leadId: lead._id, brokerageId: brokerage._id })));
  }
  return LEADS.length;
}
