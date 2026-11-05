/**@Model*/
import activityModel from '../models/activity.model';
import menuListModel from '../models/menulist.model';
/**Services */
import activityService from '../services/activity.service';
import serviceUtil from '../utils/service.util';

/**Utils */
import i18nUtil from '../utils/i18n.util';
import respUtil from '../utils/resp.util';
import pluralize from 'pluralize'

const controller = "Activity";

/**
 * Load activity and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.activity = await activityModel.get(req.params.activityId);
  return next();
}

/**
 * Get activity
 * @param req
 * @param res
 * @returns {Activity}
 */
async function get(req, res) {
  logger.info('Log:activity Controller:get: query :' + JSON.stringify(req.query), controller);

  await serviceUtil.checkPermission(req, res, "View", controller);
  let responseJson = {};
  logger.info('Log:activity Controller:' + i18nUtil.getI18nMessage('recordFound'), controller);
  responseJson.respCode = respUtil.getDetailsSuccessResponse().respCode;
  responseJson.details = req.activity;
  return res.json(responseJson);
}

/**
 * Create new activity
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Auth Controller:create: body :' + JSON.stringify(req.body), controller);
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let activity = new activityModel(req.body);
  let preCreateResult = await preCreate(activity)
  activity = await activityService.setActivityVaribles(req, activity);
  let preSaveCreateResult = await preSaveCreate(activity)
  req.activity = await activityModel.saveData(activity);
  let postSaveCreateResult = await postSaveCreate(req.activity)
  req.entityType = 'activity';
  logger.info('Log:activity Controller:' + i18nUtil.getI18nMessage('activityCreate'), controller);
  return res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing activity
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:activity Controller:update: body :' + JSON.stringify(req.body), controller);
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let activity = req.activity;
  let preUpdateResult = await preUpdate(activity)
  req.description = await serviceUtil.compareObjects(activity, req.body);
  activity = Object.assign(activity, req.body);
  let preSaveUpdateResult = await preSaveUpdate(activity)
  req.activity = await activityModel.saveData(activity);
  let postSaveUpdateResult = await postSaveUpdate(req.activity)
  req.entityType = 'activity';
  logger.info('Log:activity Controller:' + i18nUtil.getI18nMessage('activityUpdate'), controller);
  return res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Get activity list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {activities: activities, pagination: pagination}
 */
async function list(req, res, next) {
  logger.info('Log:activity Controller:list: query :' + JSON.stringify(req.query), controller);
  await serviceUtil.checkPermission(req, res, "View", controller);
  let responseJson = {};
  const query = await serviceUtil.generateListQuery(req,"activities");
  //get total activities
 
    // total count 
    query.pagination.totalCount = await activityModel.totalCount(query);

  if (req && req.query && req.query.type)
    query.filter.type = req.query.type;

  if (req && req.query && req.query.contextType)
    query.filter.contextType = req.query.contextType.toUpperCase();

  let menulist = [];
  if (req && req.tokenInfo.loginType== "employee") {  menulist = await menuListModel.find({type:"Admin"},{ _id:1 ,title:1 })}
  if (menulist.length) {
    let context = [];
    menulist.forEach(t => {
      if (t.title) {
        if (t.title == 'Email Templates') {
          t.title = 'Template'
        } else if (t.title == 'Roles') {
          t.title = 'Role'
        }
        context.push(t.title)
        context.push(pluralize.singular(serviceUtil.camelize(t.title).toUpperCase()))
        context.push(pluralize.plural(serviceUtil.camelize(t.title).toUpperCase()))
      }
    })
    if(query.filter && query.filter.context){
      query.filter["$and"] =[ {context:{ $in: context }},{context:query.filter.context}]
      delete query.filter.context
    }else{
    query.filter.context = { $in: context }
    }
  }

  const activities = await activityModel.list(query);
  logger.info('Log:activity Controller:' + i18nUtil.getI18nMessage('recordsFound'), controller);
  responseJson.respCode = respUtil.getDetailsSuccessResponse().respCode;
  responseJson.activities = activities;
  responseJson.pagination = query.pagination;
  return res.json(responseJson)
}

/**
 * Delete activity.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:activity Controller:remove: query :' + JSON.stringify(req.query), controller);
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  const activity = req.activity;
  let preRemoveResult = await preRemove(activity)
  activity.active = false;
  let preSaveRemoveResult = await preSaveRemove(activity)
  req.activity = await activityModel.saveData(activity);
  let postSaveRemoveResult = await postSaveRemove(req.activity)
  req.entityType = 'activity';
  logger.info('Log:activity Controller:' + i18nUtil.getI18nMessage('activityDelete'), controller);
  return res.json(respUtil.removeSuccessResponse(req));
}

const preCreate=async(activity)=>{
  /**@Add Your custom Logic */
}  

const preSaveCreate=async(activity)=>{
  /**@Add Your custom Logic */
} 

const postSaveCreate=async(activity)=>{
  /**@Add Your custom Logic */
}
const preUpdate=async(activity)=>{
  /**@Add Your custom Logic */
}  

const preSaveUpdate=async(activity)=>{
  /**@Add Your custom Logic */
} 

const postSaveUpdate=async(activity)=>{
  /**@Add Your custom Logic */
}
const preRemove=async(activity)=>{
  /**@Add Your custom Logic */
}  

const preSaveRemove=async(activity)=>{
  /**@Add Your custom Logic */
} 

const postSaveRemove=async(activity)=>{
  /**@Add Your custom Logic */
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove
};
