import express from 'express';
import exportToCsvViewsCtrl from '../controllers/exportToCsvViews.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router();router
  .route("/multiDelete")
  .all(authPolicy.isAllowed)
  /** POST /api/exportToCsvViews/listPreferencesId - Delete exportToCsvViews records */
  .post(asyncHandler(exportToCsvViewsCtrl.multidelete));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/exportToCsvViews/listPreferencesId -  get one exportToCsvViews using id*/
  .get(asyncHandler(exportToCsvViewsCtrl.get));
router
  .route("/")
  .all(authPolicy.isAllowed)
  /** get /api/exportToCsvViews -  get all listPreferences */
  .get(asyncHandler(exportToCsvViewsCtrl.list));
router.param("listPreferencesId", asyncHandler(exportToCsvViewsCtrl.load));
router
  .route("/")
  .all(authPolicy.isAllowed)
  /** POST /api/exportToCsvViews - Create new exportToCsvViews */
  .post(asyncHandler(exportToCsvViewsCtrl.create));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/exportToCsvViews/listPreferencesId -  get one exportToCsvViews using id*/
  .put(asyncHandler(exportToCsvViewsCtrl.update));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/exportToCsvViews/listPreferencesId -  get one exportToCsvViews using id*/
  .delete(asyncHandler(exportToCsvViewsCtrl.remove));


// export default router;
module.exports = router