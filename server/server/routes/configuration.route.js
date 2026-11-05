import express from 'express';
import configurationCtrl from '../controllers/configuration.controller.js';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); router
  .route("/multiDelete")
  .all(authPolicy.isAllowed)
  /** POST /api/fontSize/listPreferencesId - Delete fontSize records */
  .post(asyncHandler(configurationCtrl.multidelete));
  
router
  .route("/updateConfigurationsForAll")
  .all(authPolicy.isAllowed)
  /** POST /api/fontSize/listPreferencesId - Delete fontSize records */
  .post(asyncHandler(configurationCtrl.updateConfigurationsForAll));
 
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/fontSize/listPreferencesId -  get one fontSize using id*/
  .get(asyncHandler(configurationCtrl.get));
router
  .route("/")
  .all(authPolicy.isAllowed)
  /** get /api/fontSize -  get all listPreferences */
  .get(asyncHandler(configurationCtrl.list));
router.param("listPreferencesId", asyncHandler(configurationCtrl.load));

router
  .route("/")
  .all(authPolicy.isAllowed)
  /** get /api/fontSize/listPreferencesId -  get one fontSize using id*/
  .post(asyncHandler(configurationCtrl.updateFontSize));

router
  .route("/")
  .all(authPolicy.isAllowed)
  /** POST /api/fontSize - Create new fontSize */
  .post(asyncHandler(configurationCtrl.create));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/fontSize/listPreferencesId -  get one fontSize using id*/
  .put(asyncHandler(configurationCtrl.update));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/fontSize/listPreferencesId -  get one fontSize using id*/
  .delete(asyncHandler(configurationCtrl.remove));


// export default router;
module.exports = router