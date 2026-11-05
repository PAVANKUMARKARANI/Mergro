import express from "express";
import asyncHandler from "express-async-handler";
import authPolicy from "../middlewares/authenticate";
import requireEmployee from "../middlewares/requireEmployee";
import teamCtrl from "../controllers/team.controller";

const router = express.Router(); // eslint-disable-line new-cap

router.use(asyncHandler(authPolicy.isAllowed), requireEmployee);

/** POST /api/team/invites - body { invites: [{ email, role }] } (brokerage admins only) */
router.route("/invites").post(asyncHandler(teamCtrl.sendInvites));

module.exports = router;
