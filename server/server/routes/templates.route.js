import express from 'express';
import templatesCtrl from '../controllers/templates.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap


router.route('/multiDelete').all(authPolicy.isAllowed)
  /** POST /api/templates - Delete templates */
  .post(asyncHandler(templatesCtrl.multipleDelete))

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/templates - Get list of templates */
  .get(asyncHandler(templatesCtrl.list))

  /** POST /api/templates- Create new templates */
  .post(asyncHandler(templatesCtrl.create));

router.route('/:templatesId').all(authPolicy.isAllowed)
  /** GET /api/templates/:templatesId - Get templates */
  .get(asyncHandler(templatesCtrl.get))

  /** PUT /api/templates/:templatesId - Update templates */
  .put(asyncHandler(templatesCtrl.update))

  /** DELETE /api/templates/:templatesId - Delete templates */
  .delete(asyncHandler(templatesCtrl.remove));

/** Load templates when API with templatesId route parameter is hit */
router.param('templatesId', asyncHandler(templatesCtrl.load));

export default router;
