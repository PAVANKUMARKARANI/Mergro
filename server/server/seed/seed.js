import mongoose from "mongoose";
import config from "../config/config";
import Settings from "../models/settings.model";
import Role from "../models/roles.model";
import Template from "../models/templates.model";
import Employee from "../models/employee.model";
import Brokerage from "../models/brokerage.model";
import { ROLES } from "../services/onboardingSteps";
import { hashIngestKey, newIngestKey } from "../middlewares/ingestKey";
import seedDemoLeads from "./demoLeads";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Password of the demo accounts; override with SEED_USER_PASSWORD. */
const DEMO_PASSWORD = "Emp1234$";

const SETTINGS = {
  active: true,
  isTwoFactorAuthentication: false,
  enableMails: false, // set true and add sendGridApiKey + sendGridEmail to send real email
  expireTokenTime: 30 * DAY_MS, // sliding: each authenticated request extends it
  adminExpireTokenTime: 30 * DAY_MS,
  jwtExpireTokenTimeInmin: 60,
  forgotEmailInterval: 5,
};

const TEMPLATES = [
  {
    name: config.emailTemplates.adminForgetPassword,
    subject: "Reset your Mergro password",
    templateText:
      "<p>Hi ###DISPLAYNAME###!,</p><p>Use this link to choose a new password. It expires in 30 minutes.</p>" +
      '<p><a href="###LINK###">Reset password</a></p><p>If you did not ask for this, ignore this email.</p>',
  },
  {
    name: config.emailTemplates.employeeWelcome,
    subject: "You're invited to Mergro",
    templateText:
      "<p>Hi ###DISPLAYNAME###!,</p><p>Your brokerage invited you to Mergro, the AI voice agent for your leads.</p>" +
      '<p><a href="###LINK###">Set your password</a> (the link expires in 7 days).</p>',
  },
];

/** Shared demo accounts (yopmail inboxes are public: demo use only). */
const DEMO_USERS = [
  { email: "admin@yopmail.com", name: "Demo Admin", role: "brokerageAdmin" },
  { email: "agent@yopmail.com", name: "Demo Agent", role: "salesAgent" },
  { email: "lead@yopmail.com", name: "Demo Team Lead", role: "teamLead" },
];

/** Inserts the document when no document matches the filter. Returns true when inserted. */
async function insertIfMissing(Model, filter, doc) {
  const result = await Model.updateOne(filter, { $setOnInsert: doc }, { upsert: true });
  return Boolean(result.upserted && result.upserted.length) || result.upsertedCount === 1;
}

/** Seeds the database. Prints what it created. */
export default async function seed() {
  await mongoose.connect(config.mongo.host, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log(`Seeding database "${mongoose.connection.db.databaseName}"`);

  if (await insertIfMissing(Settings, { active: true }, SETTINGS)) console.log("  + settings");

  for (const role of ROLES) {
    const permissions = { Onboarding: "Edit", Team: role === "brokerageAdmin" ? "Edit" : "View" };
    const doc = { role, roleType: role, permissions, status: "Active", active: true, created: new Date() };
    if (await insertIfMissing(Role, { role, active: true }, doc)) console.log(`  + role ${role}`);
  }

  for (const t of TEMPLATES) {
    const doc = Object.assign({ templateType: "email", entityType: "employee", active: true }, t);
    if (await insertIfMissing(Template, { name: t.name, active: true }, doc)) console.log(`  + template "${t.name}"`);
  }

  const missing = [];
  for (const u of DEMO_USERS) {
    if (!(await Employee.findOne({ email: u.email }))) missing.push(u);
  }
  if (missing.length) {
    const password = process.env.SEED_USER_PASSWORD || DEMO_PASSWORD;
    let brokerage = await Brokerage.findOne({ name: "Demo Realty" });
    for (const u of missing) {
      const employee = new Employee(
        Object.assign({}, u, { password, status: "Active", active: true, created: new Date() })
      );
      if (!brokerage) {
        brokerage = await Brokerage.create({ name: "Demo Realty", ownerId: employee._id });
      }
      employee.brokerageId = brokerage._id;
      await employee.save();
      console.log(`  + user ${u.email} (${u.role})`);
    }
    console.log("  Demo users created with the demo password (see README).");
  }
  // The demo admin's brokerage, whatever onboarding renamed it to.
  const demoAdmin = await Employee.findOne({ email: "admin@yopmail.com" });
  const demoBrokerage = demoAdmin && demoAdmin.brokerageId
    ? await Brokerage.findById(demoAdmin.brokerageId)
    : await Brokerage.findOne({ name: "Demo Realty" });
  if (demoBrokerage) {
    const agent = await Employee.findOne({ email: "agent@yopmail.com" });
    const added = await seedDemoLeads(demoBrokerage, agent);
    if (added) console.log(`  + ${added} demo leads for ${demoBrokerage.name}`);
    if (!demoBrokerage.ingestKeyHash) {
      const key = newIngestKey();
      demoBrokerage.ingestKeyHash = hashIngestKey(key);
      demoBrokerage.ingestKeyPrefix = key.slice(0, 8);
      demoBrokerage.ingestKeyCreatedAt = new Date();
      await demoBrokerage.save();
      // Shown once, like the admin endpoint; rotate with POST /api/brokerage/ingest-key.
      console.log(`  + ${demoBrokerage.name} lead-ingestion key (x-mergro-key): ${key}`);
    }
  }
  console.log("Seed complete.");
  await mongoose.disconnect();
}
