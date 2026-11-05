
import FormView from '../models/formView.model';
import Employee from '../models/employee.model';
import listPreferencesService from '../services/formView.service';
import activityService from '../services/activity.service';
import respUtil from '../utils/resp.util';
import EmailService from '../services/email.service'
import serviceUtil from '../utils/service.util';
import { findOneAndUpdate } from '../auth/OAuthClient';
import { token } from 'morgan';
import mongoose from 'mongoose';
const emailService = new EmailService()


const controller = "FormView";

/**
 *  multiDelete formView.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function multidelete(req, res, next) {
  logger.info('Log:FormView Controller:multidelete: query,body :' + JSON.stringify(req.query, req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  if (req.body && req.body.selectedIds && req.body.selectedIds.length > 0) {
    await FormView.updateMany(
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
  req.entityType = 'formView';
  req.activityKey = 'formViewDelete';
  // adding formView delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

/**
 * Get formView
 * @param req
 * @param res
 * @returns {details: FormView}
 */
async function get(req, res) {
  logger.info('Log:FormView Controller:get: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  res.json({
    details: req.formView
  });
}


/**
 * Get formView list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {formView: formView, pagination: pagination}
 */
async function list(req, res, next) {
  let formView
  logger.info('Log:FormView Controller:list: query :' + JSON.stringify(req.query));
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
  req.entityType = 'formView';

  query.dbfields = { password: 0, salt: 0, _v: 0 };
  if (req.query.type === 'exportToCsv') {
    query.limit = (query.pagination.totalCount > 200) ? 200 : query.pagination.totalCount
  }
  formView = await FormView.list(query);

  // total count 
  query.pagination.totalCount = await FormView.totalCount(query);
  
  res.json({
    formView: formView,
    pagination: query.pagination
  });
}


/**
 * Load formView and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.formView = await FormView.get(req.params.listPreferencesId);
  return next();
}

/**
 * Create new formView
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:FormView Controller:create: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let formView = new FormView(req.body);
  formView.employeeId = req.tokenInfo._id;

  /** Check if a table view with the same name and screen already exists for this user */
  const existingView = await FormView.findOne({
    name: formView.name,
    screenName: formView.screenName,
    employeeId: req.tokenInfo._id,
    active: true
  });

  if (existingView) {
    // If it exists, update it
    Object.assign(existingView, req.body);
    req.formView = await FormView.saveData(existingView);
  } else {
    formView = await listPreferencesService.setCreateFormViewVariables(req, formView);
    req.formView = await FormView.saveData(formView);
  }

  /**@Update the Employee Record add listPreference Key */
  let findEmployee = await Employee.findOne({ _id: req.tokenInfo._id, active: true });
  if (findEmployee) {
    findEmployee.formView = req.formView._id;
    await Employee.saveData(findEmployee);
  }
  req.entityType = 'formView';
  req.activityKey = 'formViewCreate';

  // adding formView create activity
  activityService.insertActivity(req);
  res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing formView
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:FormView Controller:update: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let formView = req.formView;
  formView.employeeId = req.tokenInfo._id;

  //req.description = await serviceUtil.compareObjects(formView, req.body);

  formView.columnOrder = {...req.body.columnOrder }
  formView.employeeId = req.tokenInfo._id.toString();
  formView = Object.assign(formView, req.body);
  formView = await listPreferencesService.setUpdateFormViewVariables(req, formView);

  req.formView = await FormView.saveData(formView);
  req.entityType = 'formView';
  req.activityKey = 'formViewUpdate';

  // adding formView update activity
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Delete formView.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:FormView Controller:remove: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let formView = req.formView;
 const empId = mongoose.Types.ObjectId(formView.employeeId);
  const userId = mongoose.Types.ObjectId(req.tokenInfo._id);
  if (!empId.equals(userId)) {
    req.i18nKey = "onlyDeleteOwnFormViews";
    return res.json(respUtil.getErrorResponse(req));
  }
  formView.active = false;
  formView = await listPreferencesService.setUpdateFormViewVariables(req, formView);
  req.formView = await FormView.saveData(formView);
  req.entityType = 'formView';
  req.activityKey = 'formViewDelete';

  // adding formView delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

export default { multidelete, get, list, load, create, update, remove }