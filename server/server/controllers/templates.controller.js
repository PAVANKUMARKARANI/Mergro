/**Models*/
import templatesModel from '../models/templates.model';
/**Services*/
import activityService from '../services/activity.service';
import exportToCsvViewService from '../services/exportToCsvViews.service.js';
/**Utils*/
import i18nUtil from '../utils/i18n.util';
import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
import sessionUtil from '../utils/session.util';
import _ from 'lodash';

const controller = "Templates";


/**
 * Load Templates and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.templates = await templatesModel.get(req.params.templatesId);
  return next();
}
/**
 * Get templates
 * @param req
 * @param res
 * @returns {details: templates}
 */

async function get(req, res) {
  logger.info('Log:templates Controller:get: query :' + JSON.stringify(req.query), controller);
  await serviceUtil.checkPermission(req, res, "View", controller);
  req.query = await serviceUtil.generateListQuery(req);
  let templates = req.templates;
  logger.info('Log:templates Controller:get:' + i18nUtil.getI18nMessage('recordFound'), controller);
  let responseJson = {
    respCode: respUtil.getDetailsSuccessResponse().respCode,
    details: templates
  };
  return res.json(responseJson);
}

/**
 * Create new templates
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:templates Controller:create: body :' + JSON.stringify(req.body), controller);
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let templates = new templatesModel(req.body);
  let preCreateResult = await preCreate(templates)
  if (sessionUtil.getSessionLoginID(req)) {
    templates.createdBy = sessionUtil.getSessionLoginID(req);
  }
  templates.created = Date.now();
  let preSaveCreateResult = await preSaveCreate(templates)
  req.templates = await templatesModel.saveData(templates);
  let postSaveCreateResult = await postSaveCreate(req.templates)
  req.entityType = 'templates';
  req.activityKey = 'templatesCreate';
  activityService.insertActivity(req);
  logger.info('Log:templates Controller:create:' + i18nUtil.getI18nMessage('templatesCreate'), controller);
  return res.json(respUtil.createSuccessResponse(req));
};


/**
 * Update existing templates
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:templates Controller:update: body :' + JSON.stringify(req.body), controller);

  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let templates = req.templates;
  let preUpdateResult = await preUpdate(templates)
  req.description = await serviceUtil.compareObjects(templates, req.body);

  templates = Object.assign(templates, req.body);
  if (sessionUtil.getSessionLoginID(req)) {
    templates.updatedBy = sessionUtil.getSessionLoginID(req)
  }

  templates.updated = new Date();
  let preSaveUpdateResult = await preSaveUpdate(templates)
  req.templates = await templatesModel.saveData(templates);
  let postSaveUpdateResult = await postSaveUpdate(req.templates)
  req.entityType = 'templates';
  req.activityKey = 'templatesUpdate';
  activityService.insertActivity(req);
  logger.info('Log:templates Controller:update:' + i18nUtil.getI18nMessage('templatesUpdate'), controller);
  return res.json(respUtil.updateSuccessResponse(req));
  // for updating employee activity
}

/**
 * Get templates list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {templates: templates, pagination: pagination}
 */
async function list(req, res, next) {
  logger.info('Log:templates Controller:list: query :' + JSON.stringify(req.query), controller);

  await serviceUtil.checkPermission(req, res, "View", controller);
  let responseJson = {};
  const query = await serviceUtil.generateListQuery(req,"emailtemplates");
    //  total count;
    query.pagination.totalCount = await templatesModel.totalCount(query);

    if (req.query.type === 'exportToCsv') {
      query.dbfields = { _id: 0, name: 1, subject: 1, createdBy: 1, updatedBy: 1, created: 1, updated: 1 };
      query.limit = (query.pagination.totalCount>200) ? 200 : query.pagination.totalCount
    } else {
    query.dbfields = {};
  }
  //get total templatess
  let templatess = await templatesModel.list(query);
  if (req.query.type === 'exportToCsv') {
    templatess = await exportToCsvViewService.applyCsvHashingToActions(req, templatess);
  }
  logger.info('Log:templates Controller:list:' + i18nUtil.getI18nMessage('recordsFound'), controller);
  responseJson.respCode = respUtil.getDetailsSuccessResponse().respCode;
  responseJson.templates = templatess;
  responseJson.pagination = query.pagination;
  return res.json(responseJson)
}

/**
 * Delete templates.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:templates Controller:remove: query :' + JSON.stringify(req.query), controller);

  await serviceUtil.checkPermission(req, res, "Edit", controller);
  const templates = req.templates;
  let preRemoveResult = await preRemove(templates)
  templates.active = false;
  templates.updated = new Date();

  if (sessionUtil.getSessionLoginID(req)) {
    templates.updatedBy = sessionUtil.getSessionLoginID(req)
  }
  let preSaveRemoveResult = await preSaveRemove(templates)
  req.templates = await templatesModel.saveData(templates);
  let postSaveRemoveResult = await postSaveRemove(req.templates)
  req.entityType = 'templates';
  req.activityKey = 'templatesDelete';
  activityService.insertActivity(req);
  logger.info('Log:templates Controller:Delete:' + i18nUtil.getI18nMessage('templatesDelete'), controller);
  return res.json(respUtil.removeSuccessResponse(req));
  // for deleting employee activity
}

async function multipleDelete(req, res) {
  logger.info('Log:Templates Controller:multipleDelete: body :' + JSON.stringify(req.body));
  if (req.body && req.body.selectedIds && req.body.selectedIds.length > 0) {
    await templatesModel.updateMany(
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
  req.activityKey = 'templatesDelete';
  // adding template delete activity
  activityService.insertActivity(req);
  req.entityType = 'templates';
  res.json(respUtil.removeSuccessResponse(req));
}

const preCreate=async(templates)=>{
  /**@Add Your custom Logic */
}  

const preSaveCreate=async(templates)=>{
  /**@Add Your custom Logic */
} 

const postSaveCreate=async(templates)=>{
  /**@Add Your custom Logic */
}
const preUpdate=async(templates)=>{
  /**@Add Your custom Logic */
}  

const preSaveUpdate=async(templates)=>{
  /**@Add Your custom Logic */
} 

const postSaveUpdate=async(templates)=>{
  /**@Add Your custom Logic */
}
const preRemove=async(templates)=>{
  /**@Add Your custom Logic */
}  

const preSaveRemove=async(templates)=>{
  /**@Add Your custom Logic */
} 

const postSaveRemove=async(templates)=>{
  /**@Add Your custom Logic */
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  multipleDelete
};
