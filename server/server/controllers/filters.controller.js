/**Models*/
import filterModel from "../models/filters.model";
/**Services*/
import filterService from "../services/filters.service";
import activityService from "../services/activity.service";
/**Utils */
import respUtil from "../utils/resp.util";
import serviceUtil from "../utils/service.util";
import i18nUtil from "../utils/i18n.util";

const controller = "Filter";

/**
 * Get filter
 * @param req
 * @param res
 * @returns {details: Filter}
 */
async function get(req, res) {
	logger.info("Log:Filter Controller:get: query :" + JSON.stringify(req.query));
	await serviceUtil.checkPermission(req, res, "View", controller);
	res.json({
		details: req.filter,
	});
}

/**
 * Get filter list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {filters: filters, pagination: pagination}
 */
async function list(req, res, next) {
	logger.info(
		"Log:Filter Controller:list: query :" + JSON.stringify(req.query)
	);
	await serviceUtil.checkPermission(req, res, "View", controller);
	const query = await serviceUtil.generateListQuery(req);
	query.filter["$or"]= [{createdBy:req.tokenInfo._id} , {isDefaultFilter:true}]

		// total count
	query.pagination.totalCount = await filterModel.totalCount(query);
	
	req.entityType = "filter";

	//get total filters
	const filters = await filterModel.list(query);

	console.log("filterssss", JSON.stringify(filters));
	res.json({
		filters: filters,
		pagination: query.pagination,
	});
}

/**
 * Update existing filter
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
	logger.info(
		"Log:Filter Controller:update: body :" + JSON.stringify(req.body)
	);
	await serviceUtil.checkPermission(req, res, "Edit", controller);
	let filter = req.filter;
	let existingFilter=await filterModel.findOne({name:req.body.name, screenName: req.body.screenName, createdBy:req.tokenInfo._id, active:true, _id: { $ne: filter._id }})
	if(existingFilter){
		req.i18nKey= "alreadyExists";
		return res.json(respUtil.getErrorResponse(req));
	}
	filter = Object.assign(filter, req.body);
	req.query.filter = JSON.stringify(req.body.jsonQuery);
	filter.filterCriteria = JSON.stringify(serviceUtil.generateListQuery(req));

	filter = await filterService.setUpdateFilterVaribles(req, filter);
	req.filter = await filterModel.saveData(filter);
	req.entityType = "filter";
	req.activityKey = "filterUpdate";

	// adding filter update activity
	await activityService.insertActivity(req);
	res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Create new filter
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
	logger.info(
		"Log:Filter Controller:create: body :" + JSON.stringify(req.body)
	);
	await serviceUtil.checkPermission(req, res, "Edit", controller);
	let filter = new filterModel(req.body)
	let existingFilter=await filterModel.findOne({name:req.body.name, screenName: req.body.screenName, createdBy:req.tokenInfo._id, active:true})
	if(existingFilter){
		req.i18nKey= "alreadyExists";
		return res.json(respUtil.getErrorResponse(req));
	}
	req.query.filter = JSON.stringify(req.body.jsonQuery);
	filter.filterCriteria = JSON.stringify(serviceUtil.generateListQuery(req));
	filter = await filterService.setCreateFilterVaribles(req, filter);
	req.filter = await filterModel.saveData(filter);
	req.entityType = "filter";
	req.activityKey = "filterCreate";

	// adding filter create activity
	await activityService.insertActivity(req);
	res.json(respUtil.createSuccessResponse(req));
}

/**
 * Delete filter.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
	logger.info(
		"Log:Filter Controller:remove: query :" + JSON.stringify(req.query)
	);
	await serviceUtil.checkPermission(req, res, "Edit", controller);
	let filter = req.filter;
	filter.active = false;
	filter = await filterService.setUpdateFilterVaribles(req, filter);
	req.filter = await filterModel.saveData(filter);
	req.entityType = "filter";
	req.activityKey = "filterDelete";

	// adding filter delete activity
	await activityService.insertActivity(req);
	res.json(respUtil.removeSuccessResponse(req));
}

/**
 * Load filter and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
	req.filter = await filterModel.get(req.params.filterId);
	return next();
}

export default { get, list, update, create, remove, load };
