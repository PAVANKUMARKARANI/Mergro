import express from 'express';
import asyncHandler from 'express-async-handler';

import activityCtrl from '../controllers/activity.controller';
import authPolicy from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';

const controller = "Activities";
const router = express.Router(); // eslint-disable-line new-cap

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/activities - Get list of activities */
  .get(asyncHandler(activityCtrl.list))

  /** POST /api/activities - Create new activities */
  .post(authorize("View", controller),asyncHandler(activityCtrl.create));

router.route('/:activityId').all(authPolicy.isAllowed)
  /** GET /api/activities/:activityId - Get activities */
  .get(authorize("View", controller),asyncHandler(activityCtrl.get))

  /** PUT /api/activities/:activityId - Update activities */
  .put(authorize("Edit", controller),asyncHandler(activityCtrl.update))

  /** DELETE /api/activities/:activityId - Delete activities */
  .delete(authorize("Edit", controller),asyncHandler(activityCtrl.remove));

/** Load activity when API with activityId route parameter is hit */
router.param('activityId', asyncHandler(activityCtrl.load));

export default router;
