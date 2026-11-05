import express from 'express';
import paramValidate from '../config/param-validation';
import bulkuploadStatusCtrl from '../controllers/bulkuploadStatus.controller.js';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router();

router.route('/:bulkuploadStatusId').all(authPolicy.isAllowed)
  /** get /api/bulkuploadStatus/bulkuploadStatusId -  get one bulkuploadStatus using id*/
  .get(asyncHandler(bulkuploadStatusCtrl.get))

router.route('/').all(authPolicy.isAllowed)
  /** get /api/bulkuploadStatus -  get all bulkuploadStatus */
  .get(asyncHandler(bulkuploadStatusCtrl.list));

router.route('/:bulkuploadStatusId').all(authPolicy.isAllowed)
  /** get /api/bulkuploadStatus/bulkuploadStatusId -  get one bulkuploadStatus using id*/
  .put(asyncHandler(bulkuploadStatusCtrl.update));

router.route('/').all(authPolicy.isAllowed)
  /** POST /api/bulkuploadStatus - Create new bulkuploadStatus */
  .post(asyncHandler(bulkuploadStatusCtrl.create))

router.route('/:bulkuploadStatusId').all(authPolicy.isAllowed)
  /** get /api/bulkuploadStatus/bulkuploadStatusId -  get one bulkuploadStatus using id*/
  .delete(asyncHandler(bulkuploadStatusCtrl.remove));

router.param('bulkuploadStatusId', asyncHandler(bulkuploadStatusCtrl.load));

// export default router;
module.exports = router