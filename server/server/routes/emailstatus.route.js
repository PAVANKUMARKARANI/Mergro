import express from 'express';
import emailstatusCtrl from '../controllers/emailstatus.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';

const controller = "Email Status";

const router = express.Router();

router.route('/:emailstatusId').all(authPolicy.isAllowed)
  /** get /api/emailstatuss/emailstatusId -  get one emailstatus using id*/
  .get(authorize("View", controller),asyncHandler(emailstatusCtrl.get))

router.route('/').all(authPolicy.isAllowed)
  /** get /api/emailstatuss -  get all emailstatuss */
  .get(authorize("View", controller),asyncHandler(emailstatusCtrl.list));

router.route('/:emailstatusId').all(authPolicy.isAllowed)
  /** get /api/emailstatuss/emailstatusId -  get one emailstatus using id*/
  .put(authorize("Edit", controller),asyncHandler(emailstatusCtrl.update));

router.route('/').all(authPolicy.isAllowed)
  /** POST /api/emailstatuss - Create new emailstatuss */
  .post(authorize("Edit", controller),asyncHandler(emailstatusCtrl.create))

router.route('/:emailstatusId').all(authPolicy.isAllowed)
  /** get /api/emailstatuss/emailstatusId -  get one emailstatus using id*/
  .delete(authorize("Edit", controller),asyncHandler(emailstatusCtrl.remove));

router.param('emailstatusId', asyncHandler(emailstatusCtrl.load));

// export default router;
module.exports = router