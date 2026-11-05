import express from 'express';
import uploadCtrl from '../controllers/upload.controller';
import asyncHandler from 'express-async-handler';
import paramValidate from '../config/param-validation';
import authPolicy from '../middlewares/authenticate';
import csvCntrl from '../controllers/csvupload.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').all(authPolicy.isAllowed)
	.post(paramValidate.validateCheck('upload'),
		asyncHandler(paramValidate.validate), asyncHandler(uploadCtrl.upload))

// router.route('/csvUpload').all(authPolicy.isAllowed)
// 	.post(asyncHandler(uploadCtrl.csvUpload))
router.route('/bulkUpload').all(authPolicy.isAllowed)
	/** POST /api/employees/csvupload - bulkupload*/
	.post(asyncHandler(csvCntrl.BulkUpload))

router.route('/uploadAttachments').all(authPolicy.isAllowed)
	/** POST /api/uploads/uploadAttachments - mutiplefile upload*/
	.post(asyncHandler(uploadCtrl.uploadAttachements))	

router.route('/removeAttachments').all(authPolicy.isAllowed)
	/** POST /api/uploads/removeAttachments - mutiplefile remove*/
	.post(asyncHandler(uploadCtrl.removeAttachments))		

export default router;