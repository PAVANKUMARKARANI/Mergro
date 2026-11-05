import express from 'express';
import tableViewCtrl from '../controllers/tableView.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); router
  .route("/multiDelete")
  .all(authPolicy.isAllowed)
  /** POST /api/tableView/listPreferencesId - Delete tableView records */
  .post(asyncHandler(tableViewCtrl.multidelete));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/tableView/listPreferencesId -  get one tableView using id*/
  .get(asyncHandler(tableViewCtrl.get));
router
  .route("/")
  .all(authPolicy.isAllowed)
  /** get /api/tableView -  get all listPreferences */
  .get(asyncHandler(tableViewCtrl.list));
router.param("listPreferencesId", asyncHandler(tableViewCtrl.load));
router
  .route("/")
  .all(authPolicy.isAllowed)
  /** POST /api/tableView - Create new tableView */
  .post(asyncHandler(tableViewCtrl.create));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/tableView/listPreferencesId -  get one tableView using id*/
  .put(asyncHandler(tableViewCtrl.update));
router
  .route("/:listPreferencesId")
  .all(authPolicy.isAllowed)
  /** get /api/tableView/listPreferencesId -  get one tableView using id*/
  .delete(asyncHandler(tableViewCtrl.remove));


// export default router;
module.exports = router