import express from 'express';
import settingsCtrl from '../controllers/settings.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  // router.route('/').all(authPolicy.isAllowed)
  /** GET /api/settings - Get list of settings */
  .get(asyncHandler(settingsCtrl.list))

  /** POST /api/settings- Create new settings */
  .post(asyncHandler(settingsCtrl.create));

router.route('/:settingsId').all(authPolicy.isAllowed)
  /** GET /api/settings/:settingsId - Get settings */
  .get(asyncHandler(settingsCtrl.get))

  /** PUT /api/settings/:settingsId - Update settings */
  .put(asyncHandler(settingsCtrl.update))

  /** DELETE /api/settings/:settingsId - Delete settings */
  .delete(asyncHandler(settingsCtrl.remove));

/** Load settings when API with settingsId route parameter is hit */
router.param('settingsId', asyncHandler(settingsCtrl.load));

export default router;
