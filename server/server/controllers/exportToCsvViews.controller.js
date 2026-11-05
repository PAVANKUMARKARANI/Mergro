
import exportToCsvViewsModel from '../models/exportToCsvViews.model';
import employeeModel from '../models/employee.model';
import listPreferencesService from '../services/listPreferences.service';
import activityService from '../services/activity.service';
import respUtil from '../utils/resp.util';
import EmailService from '../services/email.service'
import serviceUtil from '../utils/service.util';
import { findOneAndUpdate } from '../auth/OAuthClient';
import { token } from 'morgan';
import mongoose  from 'mongoose';
const emailService = new EmailService()


const controller = "ExportToCsvViews";

/**
 *  multiDelete exportToCsvViews.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function multidelete(req, res, next) {
  logger.info('Log:ExportToCsvViews Controller:multidelete: query,body :' + JSON.stringify(req.query, req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  if (req.body && req.body.selectedIds && req.body.selectedIds.length > 0) {
    await exportToCsvViewsModel.updateMany(
      { _id: { $in: req.body.selectedIds } },
      {
        $set: {
          active: false,
          updated: new Date()
        }
      },
      { multi: true }
    );
  }
  req.entityType = 'exportToCsvViews';
  req.activityKey = 'exportToCsvViewsDelete';
  // adding exportToCsvViews delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

/**
 * Get exportToCsvViews
 * @param req
 * @param res
 * @returns {details: ExportToCsvViews}
 */
async function get(req, res) {
  logger.info('Log:ExportToCsvViews Controller:get: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  res.json({
    details: req.exportToCsvViews
  });
}


/**
 * Get exportToCsvViews list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {exportToCsvViews: exportToCsvViews, pagination: pagination}
 */
async function list(req, res, next) {
  let exportToCsvViews
  logger.info('Log:ExportToCsvViews Controller:list: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  const query = await serviceUtil.generateListQuery(req);
  //Visibility condition: created by user or isGlobal
  let employeeId = mongoose.Types.ObjectId(req.tokenInfo._id);
  
  query.filter = {
    ...query.filter,
    $or: [
      { 
        employeeId: employeeId,
      },
      { isDefault: true }
    ]
  };
    
  
  let roleDetails = {}
  req.entityType = 'exportToCsvViews';
  
  query.dbfields = { password: 0, salt: 0, _v: 0 };
  if (req.query.type === 'exportToCsv') {
    query.limit = (query.pagination.totalCount > 200) ? 200 : query.pagination.totalCount
  }
  exportToCsvViews = await exportToCsvViewsModel.list(query);
  
    // total count 
    query.pagination.totalCount = await exportToCsvViewsModel.totalCount(query);
  
  res.json({
    exportToCsvViews: exportToCsvViews,
    pagination: query.pagination
  });
}


/**
 * Load exportToCsvViews and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.exportToCsvViews = await exportToCsvViewsModel.get(req.params.listPreferencesId);
  return next();
}

/**
 * Create new exportToCsvViews
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:ExportToCsvViews Controller:create: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let exportToCsvViews = new exportToCsvViewsModel(req.body);
  exportToCsvViews.employeeId = req.tokenInfo._id;

  /** Check if a table view with the same name and screen already exists for this user */
  const existingView = await exportToCsvViewsModel.findOne({
    viewName: exportToCsvViews.viewName,
    screenName: exportToCsvViews.screenName,
    employeeId: req.tokenInfo._id,
    active: true
  });

  if (existingView) {
    // If it exists, update it
    Object.assign(existingView, req.body);
    req.exportToCsvViews = await exportToCsvViewsModel.saveData(existingView);
  } else {
    exportToCsvViews = await listPreferencesService.setCreateListPreferencesVariables(req, exportToCsvViews);
    req.exportToCsvViews = await exportToCsvViewsModel.saveData(exportToCsvViews);
  }

  /**@Update the Employee Record add listPreference Key */
  let findEmployee = await employeeModel.findOne({_id:req.tokenInfo._id,active:true});
  if(findEmployee){
    findEmployee.exportToCsvViews = req.exportToCsvViews._id;
    await employeeModel.saveData(findEmployee);
  }
  req.entityType = 'exportToCsvViews';
  req.activityKey = 'exportToCsvViewsCreate';
  
  // adding exportToCsvViews create activity
  activityService.insertActivity(req);
  res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing exportToCsvViews
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:ExportToCsvViews Controller:update: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let exportToCsvViews = req.exportToCsvViews;
  exportToCsvViews.employeeId = req.tokenInfo._id;
  
  //req.description = await serviceUtil.compareObjects(exportToCsvViews, req.body);

  exportToCsvViews.fields = {...req.body.exportToCsvViews}
  exportToCsvViews.employeeId = req.tokenInfo._id.toString();
  exportToCsvViews = await listPreferencesService.setUpdateListPreferencesVariables(req, exportToCsvViews);
  exportToCsvViews=  Object.assign(exportToCsvViews, req.body);

  req.exportToCsvViews = await exportToCsvViewsModel.saveData(exportToCsvViews);
  req.entityType = 'exportToCsvViews';
  req.activityKey = 'exportToCsvViewsUpdate';

  // adding exportToCsvViews update activity
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Delete exportToCsvViews.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:ExportToCsvViews Controller:remove: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let exportToCsvViews = req.exportToCsvViews;
  const empId = mongoose.Types.ObjectId(exportToCsvViews.employeeId);
  const userId = mongoose.Types.ObjectId(req.tokenInfo._id);
  if (!empId.equals(userId)) {
    req.i18nKey = "onlyDeleteOwnExportToCsvViews";
    return res.json(respUtil.getErrorResponse(req));
  }
  exportToCsvViews.active = false;
  exportToCsvViews = await listPreferencesService.setUpdateListPreferencesVariables(req, exportToCsvViews);
  req.exportToCsvViews = await exportToCsvViewsModel.saveData(exportToCsvViews);
  req.entityType = 'exportToCsvViews';
  req.activityKey = 'exportToCsvViewsDelete';

  // adding exportToCsvViews delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

export default {multidelete,get,list,load,create,update,remove}