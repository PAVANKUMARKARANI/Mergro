/**Model*/
import filterModel from "../models/filters.model";
/**Util*/
import sessionUtil from '../utils/session.util';

/**
 * set Filter variables
 * @returns {filterModel}
 */
const setCreateFilterVaribles = async (req, filter) => {
	if (req.tokenInfo) {
		filter.createdBy = sessionUtil.getSessionLoginID(req);
		filter.createdByName = sessionUtil.getSessionLoginName(req);
	}
	filter.created = Date.now();
	if(req.body.defaultFilter){
		filter.defaultFilter = req.body.defaultFilter;
		let findDefaultFilter = await filterModel.find({defaultFilter:true});
		if(findDefaultFilter.length > 0){
			await filterModel.updateMany({defaultFilter:true},{$set:{defaultFilter:false} });
		}	
	}
	return filter;
};

/**
 * set Filter update variables
 * @returns {filterModel}
 */
const setUpdateFilterVaribles = async (req, filter) => {
	filter.updated = Date.now();
	if (req.tokenInfo) {
		filter.updatedByName = sessionUtil.getSessionLoginName(req);
		filter.updatedBy = sessionUtil.getSessionLoginID(req);
	}
	
	if (req.body && req.body.defaultFilter === true) {
		filter.defaultFilter = true;
		await filterModel.updateMany(
			{
				_id: { $ne: filter._id },
				defaultFilter: true
			},
			{
				$set: { defaultFilter: false }
			}
		);
	}
	return filter;
};

export default {
	setCreateFilterVaribles,
	setUpdateFilterVaribles,
};
