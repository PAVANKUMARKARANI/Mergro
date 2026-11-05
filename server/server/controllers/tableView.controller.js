
import TableView from '../models/tableView.model';
import Employee from '../models/employee.model';
import listPreferencesService from '../services/tableView.service';
import activityService from '../services/activity.service';
import respUtil from '../utils/resp.util';
import EmailService from '../services/email.service'
import serviceUtil from '../utils/service.util';
import { findOneAndUpdate } from '../auth/OAuthClient';
import { token } from 'morgan';
import mongoose from 'mongoose';
const emailService = new EmailService()


const controller = "TableView";

/**
 *  multiDelete tableView.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function multidelete(req, res, next) {
  logger.info('Log:TableView Controller:multidelete: query,body :' + JSON.stringify(req.query, req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  if (req.body && req.body.selectedIds && req.body.selectedIds.length > 0) {
    await TableView.updateMany(
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
  req.entityType = 'tableView';
  req.activityKey = 'tableViewDelete';
  // adding tableView delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

/**
 * Get tableView
 * @param req
 * @param res
 * @returns {details: TableView}
 */
async function get(req, res) {
  logger.info('Log:TableView Controller:get: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  res.json({
    details: req.tableView
  });
}


/**
 * Get tableView list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {tableView: tableView, pagination: pagination}
 */
async function list(req, res, next) {
  let tableView
  logger.info('Log:TableView Controller:list: query :' + JSON.stringify(req.query));
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
      { isGlobal: true }
    ]
  };

  let roleDetails = {}
  req.entityType = 'tableView';

  query.dbfields = { password: 0, salt: 0, _v: 0 };
  if (req.query.type === 'exportToCsv') {
    query.limit = (query.pagination.totalCount > 200) ? 200 : query.pagination.totalCount
  }
  tableView = await TableView.list(query);

  // total count 
  query.pagination.totalCount = await TableView.totalCount(query);
  
  res.json({
    tableView: tableView,
    pagination: query.pagination
  });
}


/**
 * Load tableView and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.tableView = await TableView.get(req.params.listPreferencesId);
  return next();
}

/**
 * Create new tableView
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:TableView Controller:create: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let tableView = new TableView(req.body);
  tableView.employeeId = req.tokenInfo._id;

  /** Check if a table view with the same name and screen already exists for this user */
  const existingView = await TableView.findOne({
    name: tableView.name,
    screenName: tableView.screenName,
    employeeId: req.tokenInfo._id,
    active: true
  });

  if (existingView) {
    // If it exists, update it
    Object.assign(existingView, req.body);
    req.tableView = await TableView.saveData(existingView);
  } else {
    tableView = await listPreferencesService.setCreateTableViewVariables(req, tableView);
    req.tableView = await TableView.saveData(tableView);
  }

  /**@Update the Employee Record add listPreference Key */
  let findEmployee = await Employee.findOne({ _id: req.tokenInfo._id, active: true });
  if (findEmployee) {
    findEmployee.tableView = req.tableView._id;
    await Employee.saveData(findEmployee);
  }
  req.entityType = 'tableView';
  req.activityKey = 'tableViewCreate';

  // adding tableView create activity
  activityService.insertActivity(req);
  res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing tableView
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:TableView Controller:update: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let tableView = req.tableView;
  tableView.employeeId = req.tokenInfo._id;

  //req.description = await serviceUtil.compareObjects(tableView, req.body);

  tableView.columnOrder = {...req.body.columnOrder }
  tableView.employeeId = req.tokenInfo._id.toString();
  tableView = Object.assign(tableView, req.body);
  tableView = await listPreferencesService.setUpdateTableViewVariables(req, tableView);

  req.tableView = await TableView.saveData(tableView);
  req.entityType = 'tableView';
  req.activityKey = 'tableViewUpdate';

  // adding tableView update activity
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Delete tableView.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:TableView Controller:remove: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let tableView = req.tableView;
 const empId = mongoose.Types.ObjectId(tableView.employeeId);
  const userId = mongoose.Types.ObjectId(req.tokenInfo._id);
  if (!empId.equals(userId)) {
    req.i18nKey = "onlyDeleteOwnTableViews";
    return res.json(respUtil.getErrorResponse(req));
  }
  tableView.active = false;
  tableView = await listPreferencesService.setUpdateTableViewVariables(req, tableView);
  req.tableView = await TableView.saveData(tableView);
  req.entityType = 'tableView';
  req.activityKey = 'tableViewDelete';

  // adding tableView delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

export default { multidelete, get, list, load, create, update, remove }