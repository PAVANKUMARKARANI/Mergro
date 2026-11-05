
import fontSizeModel from '../models/fontSize.model';
import employeeModel from '../models/employee.model';
import listPreferencesService from '../services/listPreferences.service';
import activityService from '../services/activity.service';
import respUtil from '../utils/resp.util';
import EmailService from '../services/email.service'
import serviceUtil from '../utils/service.util';
import { findOneAndUpdate } from '../auth/OAuthClient';
import { token } from 'morgan';
import mongoose from 'mongoose';
const emailService = new EmailService()


const controller = "FontSize";

/**
 *  multiDelete fontSize.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function multidelete(req, res, next) {
  logger.info('Log:FontSize Controller:multidelete: query,body :' + JSON.stringify(req.query, req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  if (req.body && req.body.selectedIds && req.body.selectedIds.length > 0) {
    await fontSizeModel.updateMany(
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
  req.entityType = 'fontSize';
  req.activityKey = 'fontSizeDelete';
  // adding fontSize delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

/**
 * Get fontSize
 * @param req
 * @param res
 * @returns {details: FontSize}
 */
async function get(req, res) {
  logger.info('Log:FontSize Controller:get: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  res.json({
    details: req.fontSize
  });
}


/**
 * Get fontSize list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {fontSize: fontSize, pagination: pagination}
 */
async function list(req, res, next) {
  let fontSize
  logger.info('Log:FontSize Controller:list: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  const query = await serviceUtil.generateListQuery(req);

  let roleDetails = {}
  req.entityType = 'fontSize';

  query.dbfields = { password: 0, salt: 0, _v: 0 };
  if (req.query.type === 'exportToCsv') {
    query.limit = (query.pagination.totalCount > 200) ? 200 : query.pagination.totalCount
  }
  fontSize = await fontSizeModel.list(query);

    // total count 
  query.pagination.totalCount = await fontSizeModel.totalCount(query);
  
  res.json({
    fontSize: fontSize,
    pagination: query.pagination
  });
}


/**
 * Load fontSize and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.fontSize = await fontSizeModel.get(req.params.listPreferencesId);
  return next();
}

/**
 * Create new fontSize
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:FontSize Controller:create: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let fontSize = new fontSizeModel(req.body);

  fontSize = await listPreferencesService.setCreateFontSizeVariables(req, fontSize);
  req.fontSize = await fontSizeModel.saveData(fontSize);


  /**@Update the Employee Record add listPreference Key */
  let findEmployee = await employeeModel.findOne({ _id: req.tokenInfo._id, active: true });
  if (findEmployee) {
    findEmployee.fontSize = req.fontSize._id;
    await employeeModel.saveData(findEmployee);
  }
  req.entityType = 'fontSize';
  req.activityKey = 'fontSizeCreate';

  // adding fontSize create activity
  activityService.insertActivity(req);
  res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing fontSize
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:FontSize Controller:update: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let fontSize = req.fontSize;
  fontSize.employeeId = req.tokenInfo._id;

  req.description = await serviceUtil.compareObjects(fontSize, req.body);

  fontSize.columnOrder = { ...req.body.columnOrder }
  fontSize.employeeId = req.tokenInfo._id.toString();
  fontSize = await listPreferencesService.setUpdateFontSizeVariables(req, fontSize);

  req.fontSize = await fontSizeModel.saveData(fontSize);
  req.entityType = 'fontSize';
  req.activityKey = 'fontSizeUpdate';

  // adding fontSize update activity
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Delete fontSize.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:FontSize Controller:remove: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let fontSize = req.fontSize;
  const empId = mongoose.Types.ObjectId(fontSize.employeeId);
  const userId = mongoose.Types.ObjectId(req.tokenInfo._id);
  if (!empId.equals(userId)) {
    req.i18nKey = "onlyDeleteOwnTableViews";
    return res.json(respUtil.getErrorResponse(req));
  }
  fontSize.active = false;
  fontSize = await listPreferencesService.setUpdateFontSizeVariables(req, fontSize);
  req.fontSize = await fontSizeModel.saveData(fontSize);
  req.entityType = 'fontSize';
  req.activityKey = 'fontSizeDelete';

  // adding fontSize delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};


async function updateFontSize(req, res, next) {
  logger.info('Log:FontSize Controller:create: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let fontSize = new fontSizeModel(req.body);
  const employeeId = req.tokenInfo._id.toString();

  // Check if record exists
  let existingFontSize = await fontSizeModel.findOne({ active: true, employeeId: employeeId });

  if (!existingFontSize) {
    // If not exists, create new
    fontSize.employeeId = req.tokenInfo._id;
    let created = await fontSizeModel.saveData(fontSize);

    // Insert activity
    req.entityType = 'fontSize';
    req.activityKey = 'fontSizeCreate';
    req.description = 'Created new font size configuration';
    req.fontSize = created;
    await activityService.insertActivity(req);

    return res.json({
      respCode: 201,
      respMessage: "Configure Font Size created successfully"
    });

  } else {
    // If exists, update record
    const description = await serviceUtil.compareObjects(existingFontSize, req.body);
    // Update only the necessary fields
    Object.assign(existingFontSize, req.body);
    existingFontSize.employeeId = req.tokenInfo._id;

    let updated = await fontSizeModel.saveData(existingFontSize);
    req.entityType = 'fontSize';
    req.activityKey = 'fontSizeUpdate';
    req.description = description;
    req.fontSize = updated;
    await activityService.insertActivity(req);

    return res.json({
      respCode: 201,
      respMessage: "Configure Font Size updated successfully"
    });
  }
}

export default { multidelete, get, list, load, create, update, remove, updateFontSize }