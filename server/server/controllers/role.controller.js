/**Models*/
import roleModel from '../models/roles.model';
/**services*/
import activityService from '../services/activity.service';
import roleService from '../services/role.service';
import exportToCsvViewService from '../services/exportToCsvViews.service.js';
/**Utils*/
import respUtil from '../utils/resp.util';
import i18nService from '../utils/i18n.util';
import serviceUtil from '../utils/service.util';
import sessionUtil from '../utils/session.util';

const controller = "Role";

/**
 * Load role and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.role = await roleModel.get(req.params.roleId);
  return next();
}

/**
 * Get role
 * @param req
 * @param res
 * @returns {role}
 */
async function get(req, res) {
  logger.info('Log:role Controller:get: query :' + JSON.stringify(req.query), controller);

  await serviceUtil.checkPermission(req, res, "View", controller);
  let responseJson = {};
  logger.info('Log:role Controller:' + i18nService.getI18nMessage('recordFound'), controller);
  responseJson.respCode = respUtil.getDetailsSuccessResponse().respCode;
  responseJson.details = req.role;
  return res.json(responseJson);
}

/**
 * Create new role
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Auth Controller:create: body :' + JSON.stringify(req.body), controller);

  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let role = new roleModel(req.body);
  let error = ''
  let preCreateResult = await preCreate(role,error)
  if(preCreateResult == 'true'){
    req.i18nKey = 'roleAlreadyExists';
    return res.json(respUtil.getErrorResponse(req));
  }
  role = await roleService.setCreateRoleVaribles(req, role);
  let preSaveCreateResult = await preSaveCreate(role)
  req.role = await roleModel.saveData(role);
  let postSaveCreateResult = await postSaveCreate(req.role)
  req.contextId = req.role._id;
  req.entityType = 'role';
  req.activityKey = 'roleCreate';
  activityService.insertActivity(req);
  logger.info('Log:role Controller:' + i18nService.getI18nMessage('roleCreate'), controller);
  return res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing role
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:role Controller:update: body :' + JSON.stringify(req.body), controller);

  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let role = req.role;
  let error = ''
  let preUpdateResult = await preUpdate(req.body,error,role._id)
  if(preUpdateResult == 'true'){
    req.i18nKey = 'roleAlreadyExists';
    return res.json(respUtil.getErrorResponse(req));
  }
  req.description = await serviceUtil.compareObjects(role, req.body);

  role = await roleService.setUpdateRoleVaribles(req, role);
  role = Object.assign(role, req.body);
  let preSaveUpdateResult = await preSaveUpdate(role)
  req.role = await roleModel.saveData(role);
  let postSaveUpdateResult = await postSaveUpdate(req.role)
  req.contextId = req.role._id;
  req.entityType = 'role';
  req.activityKey = 'roleUpdate';
  activityService.insertActivity(req);
  logger.info('Log:role Controller:' + i18nService.getI18nMessage('roleUpdate'), controller);
  return res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Get role list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {role: roles, pagination: pagination}
 */
async function list(req, res, next) {
  logger.info('Log:role Controller:list: query :' + JSON.stringify(req.query), controller);

  await serviceUtil.checkPermission(req, res, "View", controller);
  let responseJson = {};
  const query = await serviceUtil.generateListQuery(req,"roles");

  // total count 
  query.pagination.totalCount = await roleModel.totalCount(query);
  
    if (req.query.type === 'exportToCsv') {
      query.dbfields = { _id:0,role:1, status:1, roleType:1, createdBy:1, updatedBy:1, created:1, updated:1 };
      //query.limit = query.pagination.totalCount;
      query.limit = (query.pagination.totalCount>200) ? 200 : query.pagination.totalCount
    } else {
      query.dbfields = {};
    }
  //get total roles
  let roles = await roleModel.list(query);
    if (req.query.type === 'exportToCsv') {
    roles = await exportToCsvViewService.applyCsvHashingToActions(req, roles);
  }
  logger.info('Log:role Controller:' + i18nService.getI18nMessage('recordsFound'), controller);
  responseJson.respCode = respUtil.getDetailsSuccessResponse().respCode;
  responseJson.roles = roles;
  responseJson.pagination = query.pagination;
  return res.json(responseJson)
}

/**
 * Delete role.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:role Controller:remove: query :' + JSON.stringify(req.query), controller);

  await serviceUtil.checkPermission(req, res, "Edit", controller);
  const role = req.role;
  let preRemoveResult = await preRemove(role)
  role.active = false;
  let preSaveRemoveResult = await preSaveRemove(role)
  req.role = await roleModel.saveData(role);
  let postSaveRemoveResult = await postSaveRemove(req.role)
  req.contextId = req.role._id;
  req.entityType = 'role';
  req.activityKey = 'roleDelete';
  activityService.insertActivity(req);
  logger.info('Log:role Controller:' + i18nService.getI18nMessage('roleDelete'), controller);
  return res.json(respUtil.removeSuccessResponse(req));
}

async function multipleDelete(req, res) {
  logger.info('Log:Role Controller:multipleDelete: body :' + JSON.stringify(req.body));
  if (req.body && req.body.selectedIds && req.body.selectedIds.length > 0) {
    await roleModel.updateMany(
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
  req.activityKey = 'roleDelete';
  // adding template delete activity
  activityService.insertActivity(req);
  req.entityType = 'role';
  res.json(respUtil.removeSuccessResponse(req));
}

const preCreate=async(role,error)=>{
  let roleType  = role.roleType ? role.roleType.toLowerCase().trim() : ''; 
  let roleCheck = role.role ? role.role.toLowerCase().trim() : '';

  let checkRoleAlreadyExists = await roleModel.findOne({
    role: new RegExp(`^${roleCheck}$`, 'i'),
    roleType: new RegExp(`^${roleType}$`, 'i'),
    status: "Active",
    active: true
  });
  if(checkRoleAlreadyExists){
    return error = 'true'
  }
  else{
    return true
  }
}  

const preSaveCreate=async(role)=>{
  /**@Add Your custom Logic */
} 

const postSaveCreate=async(role)=>{
  /**@Add Your custom Logic */
}
const preUpdate=async(role,error,id)=>{
  let roleType  = role.roleType ? role.roleType.toLowerCase().trim() : ''; 
  let roleCheck = role.role ? role.role.toLowerCase().trim() : '';

  let checkRoleAlreadyExists = await roleModel.findOne({
    role: new RegExp(`^${roleCheck}$`, 'i'),
    roleType: new RegExp(`^${roleType}$`, 'i'),
    status: "Active",
    _id:{$ne:id},
    active: true
  });
  if(checkRoleAlreadyExists){
    return error = 'true'
  }
  else{
    return true
  }
} 

const preSaveUpdate=async(role)=>{
  /**@Add Your custom Logic */
} 

const postSaveUpdate=async(role)=>{
  /**@Add Your custom Logic */
}
const preRemove=async(role)=>{
  /**@Add Your custom Logic */
}  

const preSaveRemove=async(role)=>{
  /**@Add Your custom Logic */
} 

const postSaveRemove=async(role)=>{
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
