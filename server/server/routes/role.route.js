import express from 'express';
import roleCtrl from '../controllers/role.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';

const controller = "Roles";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/multiDelete').all(authPolicy.isAllowed)
  /** POST /api/roles - Delete roles */
  .post(authorize("Edit", controller),asyncHandler(roleCtrl.multipleDelete))

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/roles - Get list of roles */
  .get(authorize("View", controller),asyncHandler(roleCtrl.list))

  /** POST /api/roles - Create new roles */
  .post(authorize("Edit", controller),asyncHandler(roleCtrl.create));

router.route('/:roleId').all(authPolicy.isAllowed)
  /** GET /api/roles/:roleId - Get roles */
  .get(authorize("View", controller),asyncHandler(roleCtrl.get))

  /** PUT /api/roles/:roleId - Update roles */
  .put(authorize("Edit", controller),asyncHandler(roleCtrl.update))

  /** DELETE /api/roles/:roleId - Delete roles */
  .delete(authorize("Edit", controller),asyncHandler(roleCtrl.remove));


/** Load activity when API with roleId route parameter is hit */
router.param('roleId', asyncHandler(roleCtrl.load));

export default router;
