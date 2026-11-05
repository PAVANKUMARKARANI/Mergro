
import versionsModel from '../models/versions.model.js';
import versionsService from '../services/versions.service.js';
import activityService from '../services/activity.service.js';
import respUtil from '../utils/resp.util.js';
import EmailService from '../services/email.service.js'
import serviceUtil from '../utils/service.util.js';
const emailService = new EmailService()
import _ from 'lodash';


const controller = "Versions";

/**
 *  multiDelete versions.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function multidelete(req, res, next) {
  logger.info('Log:Versions Controller:multidelete: query,body :' + JSON.stringify(req.query, req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  if (req.body && req.body.selectedIds && req.body.selectedIds.length > 0) {
    await versionsModel.updateMany(
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
  req.entityType = 'versions';
  req.activityKey = 'versionsDelete';
  // adding versions delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

/**
 * Get versions
 * @param req
 * @param res
 * @returns {details: Versions}
 */
async function get(req, res) {
  logger.info('Log:Versions Controller:get: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  res.json({
    details: req.versions
  });
}


/**
 * Get versions list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {versions: versions, pagination: pagination}
 */
async function list(req, res, next) {
  let versions;
  logger.info('Log:Version Controller:list: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  const query = await serviceUtil.generateListQuery(req, "version");
  let roleDetails = {}

  req.entityType = 'versions';
  query.dbfields = { password: 0, salt: 0, _v: 0 };
  if (req.query.type === 'exportToCsv') {
    query.limit = (query.pagination.totalCount > 200) ? 200 : query.pagination.totalCount
  }
  // total count 
  query.pagination.totalCount = await versionsModel.totalCount(query);

  versions = await versionsModel.list(query); 
  res.json({
    versions: versions,
    pagination: query.pagination
  });
}


/**
 * Load versions and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.versions = await versionsModel.get(req.params.versionsId);
  return next();
}

/**
 * Create new versions
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Versions Controller:create: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let versions = new versionsModel(req.body);

  versions = await versionsService.setCreateVersionsVariables(req, versions);
  req.versions = await versionsModel.saveData(versions);
  req.entityType = 'versions';
  req.activityKey = 'versionsCreate';

  // adding versions create activity
  activityService.insertActivity(req);
  res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing versions
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Versions Controller:update: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let versions = req.versions;

  req.description = await serviceUtil.compareObjects(versions, req.body);
  versions = Object.assign(versions, req.body);
  versions = await versionsService.setUpdateVersionsVariables(req, versions);

  req.versions = await versionsModel.saveData(versions);
  req.entityType = 'versions';
  req.activityKey = 'versionsUpdate';

  // adding versions update activity
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Delete versions.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Versions Controller:remove: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let versions = req.versions;
  
  versions.active = false;
  versions = await versionsService.setUpdateVersionsVariables(req, versions);
  req.versions = await versionsModel.saveData(versions);
  req.entityType = 'versions';
  req.activityKey = 'versionsDelete';

  // adding versions delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
}; 


async function multiupdate(req, res, next) {
  logger.info('Log:Versions Controller:multiupdate: query,body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  if (req.body && req.body.selectedIds && req.body.selectedIds.length > 0 && req.body.updatedDetails) {
    await versionsModel.updateMany({
      _id: { $in: req.body.selectedIds }
    },
      { $set: req.body.updatedDetails }
    )
  }
  req.entityType = 'versions';
  req.activityKey = 'versionsUpdate';
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
}


export default { multidelete, get, list, load, create, update, remove, multiupdate }