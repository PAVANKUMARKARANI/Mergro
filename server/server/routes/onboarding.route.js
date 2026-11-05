import express from "express";
import asyncHandler from "express-async-handler";
import authPolicy from "../middlewares/authenticate";
import requireEmployee from "../middlewares/requireEmployee";
import onboardingCtrl from "../controllers/onboarding.controller";

const router = express.Router(); // eslint-disable-line new-cap

router.use(asyncHandler(authPolicy.isAllowed), requireEmployee);

/** GET /api/onboarding - role, steps, completed/skipped steps and saved drafts */
router.route("/").get(asyncHandler(onboardingCtrl.getProgress));

/** PUT /api/onboarding/steps/:stepId - body { data } to save, or { skipped: true } */
router.route("/steps/:stepId").put(asyncHandler(onboardingCtrl.saveStep));

/** POST /api/onboarding/complete - finish onboarding (admins: activates the brokerage) */
router.route("/complete").post(asyncHandler(onboardingCtrl.complete));

module.exports = router;
