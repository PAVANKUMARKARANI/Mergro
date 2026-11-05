import express from 'express';
import employeeCtrl from '../controllers/employee.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';

const controller = "Employees";
const router = express.Router();router
  .route("/multiUpdate")
  .all(authPolicy.isAllowed)
  /** POST /api/employees/employeeId - Delete employee records */
  .post(authorize("Edit", controller), asyncHandler(employeeCtrl.multiupdate));
router
  .route("/register")
  /** POST /api/employees - Register new employees */
  .post(asyncHandler(employeeCtrl.register));
router
  .route("/multiDelete")
  .all(authPolicy.isAllowed)
  /** POST /api/employees/employeeId - Delete employee records */
  .post(authorize("Edit", controller), asyncHandler(employeeCtrl.multidelete));
router
  .route("/:employeeId")
  .all(authPolicy.isAllowed)
  /** get /api/employees/employeeId -  get one employee using id*/
  .get(authorize("View", controller), asyncHandler(employeeCtrl.get));
router
  .route("/")
  .all(authPolicy.isAllowed)
  /** get /api/employees -  get all employees */
  .get(authorize("View", controller), asyncHandler(employeeCtrl.list));
router.param("employeeId", asyncHandler(employeeCtrl.load));
router
  .route("/")
  .all(authPolicy.isAllowed)
  /** POST /api/employees - Create new employees */
  .post(authorize("Edit", controller), asyncHandler(employeeCtrl.create));
router
  .route("/:employeeId")
  .all(authPolicy.isAllowed)
  /** get /api/employees/employeeId -  get one employee using id*/
  .put(authorize("Edit", controller), asyncHandler(employeeCtrl.update));
router
  .route("/:employeeId")
  .all(authPolicy.isAllowed)
  /** get /api/employees/employeeId -  get one employee using id*/
  .delete(authorize("Edit", controller), asyncHandler(employeeCtrl.remove));


// export default router;
module.exports = router