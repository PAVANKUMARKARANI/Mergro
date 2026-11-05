/**Models */
import bulkUploadStatusModel from '../models/bulkuploadStatus.model';
/**Services */
import activityService from '../services/activity.service';
/**Utils */
import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
import i18nUtil from '../utils/i18n.util';
import sessionUtil from '../utils/session.util';

const controller = "BulkuploadStatus";

/**
 * Get bulkuploadStatus
 * @param req
 * @param res
 * @returns {details: BulkuploadStatus}
 */
async function get(req, res) {
  logger.info('Log:BulkuploadStatus Controller:get: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  res.json({
    details: req.bulkuploadStatus
  });
}

/**
 * Get bulkuploadStatus list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {bulkuploadStatus: bulkuploadStatus, pagination: pagination}
 */
async function list(req, res, next) {
  logger.info('Log:BulkuploadStatus Controller:list: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  const query = await serviceUtil.generateListQuery(req);
  delete query.filter.school_id
  delete query.filter.district_id
  if (sessionUtil.getLoginType(req) !== 'employee') {
    query.filter.entityType = sessionUtil.getLoginType(req);
  }
    // total count 
    query.pagination.totalCount = await bulkUploadStatusModel.totalCount(query);
  
  req.entityType = 'bulkuploadStatus';

  //get total bulkuploadStatus
  const bulkuploadStatus = await bulkUploadStatusModel.list(query);
  res.json({
    bulkuploadStatus: bulkuploadStatus,
    pagination: query.pagination
  });
}


/**
 * Update existing bulkuploadStatus
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:BulkuploadStatus Controller:update: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let bulkuploadStatus = req.bulkuploadStatus;
  let preUpdateResult = await preUpdate(bulkuploadStatus)
  req.description = await serviceUtil.compareObjects(bulkuploadStatus, req.body);
  bulkuploadStatus = Object.assign(bulkuploadStatus, req.body);
  let preSaveUpdateResult = await preSaveUpdate(bulkuploadStatus)
  req.bulkuploadStatus = await bulkUploadStatusModel.saveDetails(bulkuploadStatus);
  let postSaveUpdateResult = await postSaveUpdate(req.bulkuploadStatus)
  req.entityType = 'bulkuploadStatus';
  req.activityKey = 'bulkuploadStatusUpdate';

  // adding bulkuploadStatus update activity
  await activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Create new bulkuploadStatus
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:BulkuploadStatus Controller:create: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let bulkuploadStatus = new bulkUploadStatusModel(req.body);
  let preCreateResult = await preCreate(bulkuploadStatus)
  let preSaveCreateResult = await preSaveCreate(bulkuploadStatus)
  req.bulkuploadStatus = await bulkUploadStatusModel.saveDetails(bulkuploadStatus);
  let postSaveCreateResult = await postSaveCreate(req.bulkuploadStatus)
  req.entityType = 'bulkuploadStatus';
  req.activityKey = 'bulkuploadStatusCreate';

  // adding bulkuploadStatus create activity
  await activityService.insertActivity(req);
  res.json(respUtil.createSuccessResponse(req));
}

/**
 * Delete bulkuploadStatus.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:BulkuploadStatus Controller:remove: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let bulkuploadStatus = req.bulkuploadStatus;
  let preRemoveResult = await preRemove(bulkuploadStatus)
  bulkuploadStatus.active = false;
  let preSaveRemoveResult = await preSaveRemove(bulkuploadStatus)
  req.bulkuploadStatus = await bulkUploadStatusModel.saveDetails(bulkuploadStatus);
  let postSaveRemoveResult = await postSaveRemove(req.bulkuploadStatus)
  req.entityType = 'bulkuploadStatus';
  req.activityKey = 'bulkuploadStatusDelete';

  // adding bulkuploadStatus delete activity
  await activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

/**
 * Load bulkuploadStatus and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.bulkuploadStatus = await bulkUploadStatusModel1.get(req.params.bulkuploadStatusId);
  return next();
}

async function multiDelete(req, res) {
  let body = req.body;

  logger.info('Log:BulkuploadStatus Controller:multidelete: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "Edit", controller);

  if (req.tokenInfo && req.tokenInfo.role && req.tokenInfo.role !== "superAdmin") {
    req.i18nKey = 'not_an_admin';
    return res.json(await respUtil.getErrorResponse(req));
  }

  for (let bulkuploadStatusid of body.selectedIds) {
    let bulkuploadStatus = await bulkUploadStatusModel.findOne({ _id: bulkuploadStatusid })
    bulkuploadStatus.active = false;
    req.bulkuploadStatus = await bulkUploadStatusModel.saveDetails(bulkuploadStatus);
    req.entityType = 'bulkuploadStatus';
    req.activityKey = 'bulkuploadStatusDelete';
    req.body = bulkuploadStatus
    // adding bulkuploadStatus delete activity
    activityService.insertActivity(req);
  }
  req.body = body
  req.i18nKey = "bulkuploadStatusMultiDelete";
  res.json(respUtil.successResponse(req));
};


const preCreate=async(bulkuploadStatus)=>{
  /**@Add Your custom Logic */
}  

const preSaveCreate=async(bulkuploadStatus)=>{
  /**@Add Your custom Logic */
} 

const postSaveCreate=async(bulkuploadStatus)=>{
  /**@Add Your custom Logic */
}
const preUpdate=async(bulkuploadStatus)=>{
  /**@Add Your custom Logic */
}  

const preSaveUpdate=async(bulkuploadStatus)=>{
  /**@Add Your custom Logic */
} 

const postSaveUpdate=async(bulkuploadStatus)=>{
  /**@Add Your custom Logic */
}
const preRemove=async(bulkuploadStatus)=>{
  /**@Add Your custom Logic */
}  

const preSaveRemove=async(bulkuploadStatus)=>{
  /**@Add Your custom Logic */
} 

const postSaveRemove=async(bulkuploadStatus)=>{
  /**@Add Your custom Logic */
}

export default { get, list, update, create, remove, load, multiDelete }