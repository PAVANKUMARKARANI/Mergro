import express from 'express';
import fontSizeCtrl from '../controllers/fontSize.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); router
  .route("/multiDelete")
  .all(authPolicy.isAllowed)
  /** POST /api/fontSize/listPreferencesId - Delete fontSize records */
  .post(asyncHandler(fontSizeCtrl.multidelete));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/fontSize/listPreferencesId -  get one fontSize using id*/
  .get(asyncHandler(fontSizeCtrl.get));
router
  .route("/")
  .all(authPolicy.isAllowed)
  /** get /api/fontSize -  get all listPreferences */
  .get(asyncHandler(fontSizeCtrl.list));
router.param("listPreferencesId", asyncHandler(fontSizeCtrl.load));

router
  .route("/")
  .all(authPolicy.isAllowed)
  /** get /api/fontSize/listPreferencesId -  get one fontSize using id*/
  .post(asyncHandler(fontSizeCtrl.updateFontSize));

router
  .route("/")
  .all(authPolicy.isAllowed)
  /** POST /api/fontSize - Create new fontSize */
  .post(asyncHandler(fontSizeCtrl.create));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/fontSize/listPreferencesId -  get one fontSize using id*/
  .put(asyncHandler(fontSizeCtrl.update));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/fontSize/listPreferencesId -  get one fontSize using id*/
  .delete(asyncHandler(fontSizeCtrl.remove));


// export default router;
module.exports = router