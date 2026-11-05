import express from 'express';
import formViewCtrl from '../controllers/formView.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); router
  .route("/multiDelete")
  .all(authPolicy.isAllowed)
  /** POST /api/formView/listPreferencesId - Delete formView records */
  .post(asyncHandler(formViewCtrl.multidelete));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/formView/listPreferencesId -  get one formView using id*/
  .get(asyncHandler(formViewCtrl.get));
router
  .route("/")
  .all(authPolicy.isAllowed)
  /** get /api/formView -  get all listPreferences */
  .get(asyncHandler(formViewCtrl.list));
router.param("listPreferencesId", asyncHandler(formViewCtrl.load));
router
  .route("/")
  .all(authPolicy.isAllowed)
  /** POST /api/formView - Create new formView */
  .post(asyncHandler(formViewCtrl.create));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/formView/listPreferencesId -  get one formView using id*/
  .put(asyncHandler(formViewCtrl.update));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/formView/listPreferencesId -  get one formView using id*/
  .delete(asyncHandler(formViewCtrl.remove));


// export default router;
module.exports = router