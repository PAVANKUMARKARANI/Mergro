import express from "express";
import filterCtrl from "../controllers/filters.controller";
import asyncHandler from "express-async-handler";
import authPolicy from "../middlewares/authenticate";

const router = express.Router();

router
	.route("/:filterId")
	.all(authPolicy.isAllowed)
	/** get /api/filters/filterId -  get one filter using id*/
	.get(asyncHandler(filterCtrl.get));

router
	.route("/")
	.all(authPolicy.isAllowed)
	/** get /api/filters -  get all filters */
	.get(asyncHandler(filterCtrl.list));

router
	.route("/:filterId")
	.all(authPolicy.isAllowed)
	/** get /api/filters/filterId -  get one filter using id*/
	.put(asyncHandler(filterCtrl.update));

router
	.route("/")
	.all(authPolicy.isAllowed)
	/** POST /api/filters - Create new filters */
	.post(asyncHandler(filterCtrl.create));

router
	.route("/:filterId")
	.all(authPolicy.isAllowed)
	/** get /api/filters/filterId -  get one filter using id*/
	.delete(asyncHandler(filterCtrl.remove));

router.param("filterId", asyncHandler(filterCtrl.load));

// export default router;
module.exports = router;
