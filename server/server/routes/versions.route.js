import express from 'express';
import versionsCtrl from '../controllers/versions.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';

const controller = "Versions";
const router = express.Router(); router
  .route("/multiUpdate")
  .all(authPolicy.isAllowed)
  /** POST /api/Versions/VersionsId - Delete Versions records */
  .post(authorize("Edit", controller), asyncHandler(versionsCtrl.multiupdate));
router
  .route("/multiDelete")
  .all(authPolicy.isAllowed)
  /** POST /api/Versions/VersionsId - Delete Versions records */
  .post(asyncHandler(versionsCtrl.multidelete));

router
  .route("/:VersionsId")
  .all(authPolicy.isAllowed)
  /** get /api/Versions/VersionsId -  get one Versions using id*/
  .get(authorize("View", controller), asyncHandler(versionsCtrl.get));

router
  .route("/")
  // .all(authPolicy.isAllowed)
  /** get /api/Versions -  get all Versions */
  .get( asyncHandler(versionsCtrl.list));

router.param("VersionsId", asyncHandler(versionsCtrl.load));
router
  .route("/")
  // .all(authPolicy.isAllowed)
  /** POST /api/Versions - Create new Versions */
  .post(asyncHandler(versionsCtrl.create));

router
  .route("/:VersionsId")
  .all(authPolicy.isAllowed)
  /** get /api/Versions/VersionsId -  get one Versions using id*/
  .put(asyncHandler(versionsCtrl.update));

router
  .route("/:VersionsId")
  .all(authPolicy.isAllowed)
  /** get /api/Versions/VersionsId -  get one Versions using id*/
  .delete(authorize("Edit", controller), asyncHandler(versionsCtrl.remove));


// export default router;
module.exports = router