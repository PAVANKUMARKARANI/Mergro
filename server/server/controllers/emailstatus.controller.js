/**Models*/
import emailStatusModel from '../models/emailstatus.model';
/**Services*/
import emailstatusService from '../services/emailstatus.service';
import activityService from '../services/activity.service';
/**Utils*/
import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
import i18nUtil from '../utils/i18n.util';
import sessionUtil from '../utils/session.util';

const controller = "Emailstatus";

/**
 * Get emailstatus
 * @param req
 * @param res
 * @returns {details: Emailstatus}
 */
async function get(req, res) {
  logger.info('Log:Emailstatus Controller:get: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  res.json({
    details: req.emailstatus
  });
}

/**
 * Get emailstatus list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {emailstatuss: emailstatuss, pagination: pagination}
 */
async function list(req, res, next) {
  logger.info('Log:Emailstatus Controller:list: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  const query = await serviceUtil.generateListQuery(req,"emailstatus");
  // delete query.filter.school_id

  // delete query.filter.district_id
  if (sessionUtil.getLoginType(req) !== 'employee') {
    query.filter.entityType = sessionUtil.getLoginType(req);
  }
  if (query.page === 1) {
    // total count 
    query.pagination.totalCount = await emailStatusModel.totalCount(query);
  }
  req.entityType = 'emailstatus';

  //get total emailstatuss
  const emailstatuss = await emailStatusModel.list(query);
  res.json({
    emailstatus: emailstatuss,
    pagination: query.pagination
  });
}


// /**
//  * Update existing emailstatus
//  * @param req
//  * @param res
//  * @param next
//  * @returns { respCode: respCode, respMessage: respMessage }
//  */
// async function update(req, res, next) {
//   logger.info('Log:Emailstatus Controller:update: body :' + JSON.stringify(req.body));
//   await serviceUtil.checkPermission(req, res, "Edit", controller);
//   let emailstatus = req.emailstatus;
//   emailstatus = Object.assign(emailstatus, req.body);
//   emailstatus = await emailstatusService.setUpdateEmailstatusVaribles(req, emailstatus);
//   req.emailstatus = await Emailstatus.saveDetails(emailstatus);
//   req.entityType = 'emailstatus';
//   req.activityKey = 'emailstatusUpdate';

//   // adding emailstatus update activity
//   activityService.insertActivity(req);
//   res.json(respUtil.updateSuccessResponse(req));
// }

// /**
//  * Create new emailstatus
//  * @param req
//  * @param res
//  * @returns { respCode: respCode, respMessage: respMessage }
//  */
// async function create(req, res) {
//   logger.info('Log:Emailstatus Controller:create: body :' + JSON.stringify(req.body));
//   await serviceUtil.checkPermission(req, res, "Edit", controller);
//   let emailstatus = new Emailstatus(req.body);
//   emailstatus = await emailstatusService.setCreateEmailstatusVaribles(req, emailstatus);
//   req.emailstatus = await Emailstatus.saveDetails(emailstatus);
//   req.entityType = 'emailstatus';
//   req.activityKey = 'emailstatusCreate';

//   // adding emailstatus create activity
//   activityService.insertActivity(req);
//   res.json(respUtil.createSuccessResponse(req));
// }

/**
 * Delete emailstatus.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Emailstatus Controller:remove: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let emailstatus = req.emailstatus;
  let preRemoveResult = await preRemove(emailstatus)
  emailstatus.active = false;
  emailstatus = await emailstatusService.setUpdateEmailstatusVaribles(req, emailstatus);
  let preSaveRemoveResult = await preSaveRemove(emailstatus)
  req.emailstatus = await emailStatusModel.saveDetails(emailstatus);
  let postSaveRemoveResult = await postSaveRemove(req.emailstatus)
  req.entityType = 'emailstatus';
  req.activityKey = 'emailstatusDelete';

  // adding emailstatus delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

/**
 * Load emailstatus and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.emailstatus = await emailStatusModel.get(req.params.emailstatusId);
  return next();
}

const preRemove=async(emailstatus)=>{
  /**@Add Your custom Logic */
}  

const preSaveRemove=async(emailstatus)=>{
  /**@Add Your custom Logic */
} 

const postSaveRemove=async(emailstatus)=>{
  /**@Add Your custom Logic */
}

export default { get, list, remove, load }