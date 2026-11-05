import express from 'express';
import configureScreensCtrl from '../controllers/configureScreens.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';

const router = express.Router();

router
  .route("/updateScreenFieldsToConfigurationScreen")
  .all(authPolicy.isAllowed)
  /** get /api/configureScreens/configureScreensId -  get one configureScreens using id*/
  .get(asyncHandler(configureScreensCtrl.updateScreenFieldsToConfigurationScreen));

router
  .route("/multiUpdate")
  .all(authPolicy.isAllowed)
  /** POST /api/configureScreens/configureScreensId - Delete configureScreens records */
  .post(asyncHandler(configureScreensCtrl.multiupdate));
router
  .route("/multiDelete")
  .all(authPolicy.isAllowed)
  /** POST /api/configureScreens/configureScreensId - Delete configureScreens records */
  .post(asyncHandler(configureScreensCtrl.multidelete));
router
  .route("/:configureScreensId")
  .all(authPolicy.isAllowed)
  /** get /api/configureScreens/configureScreensId -  get one configureScreens using id*/
  .get(asyncHandler(configureScreensCtrl.get));
router
  .route("/")
  .all(authPolicy.isAllowed)
  /** get /api/configureScreens -  get all configureScreens */
  .get(asyncHandler(configureScreensCtrl.list));
router.param("configureScreensId", asyncHandler(configureScreensCtrl.load));
router
  .route("/")
  .all(authPolicy.isAllowed)
  /** POST /api/configureScreens - Create new configureScreens */
  .post(asyncHandler(configureScreensCtrl.create));
router
  .route("/:configureScreensId")
  .all(authPolicy.isAllowed)
  /** get /api/configureScreens/configureScreensId -  get one configureScreens using id*/
  .put(asyncHandler(configureScreensCtrl.update));
router
  .route("/:configureScreensId")
  .all(authPolicy.isAllowed)
  /** get /api/configureScreens/configureScreensId -  get one configureScreens using id*/
  .delete(asyncHandler(configureScreensCtrl.remove));


// export default router;
module.exports = router