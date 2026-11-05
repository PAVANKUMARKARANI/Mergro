import express from 'express';
import listPreferencesCtrl from '../controllers/listPreferences.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router();router
  .route("/multiDelete")
  .all(authPolicy.isAllowed)
  /** POST /api/listPreferences/listPreferencesId - Delete listPreferences records */
  .post(asyncHandler(listPreferencesCtrl.multidelete));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/listPreferences/listPreferencesId -  get one listPreferences using id*/
  .get(asyncHandler(listPreferencesCtrl.get));
router
  .route("/")
  .all(authPolicy.isAllowed)
  /** get /api/listPreferences -  get all listPreferences */
  .get(asyncHandler(listPreferencesCtrl.list));
router.param("listPreferencesId", asyncHandler(listPreferencesCtrl.load));
router
  .route("/")
  .all(authPolicy.isAllowed)
  /** POST /api/listPreferences - Create new listPreferences */
  .post(asyncHandler(listPreferencesCtrl.create));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/listPreferences/listPreferencesId -  get one listPreferences using id*/
  .put(asyncHandler(listPreferencesCtrl.update));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/listPreferences/listPreferencesId -  get one listPreferences using id*/
  .delete(asyncHandler(listPreferencesCtrl.remove));


// export default router;
module.exports = router