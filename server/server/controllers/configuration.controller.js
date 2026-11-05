import configurationModel from "../models/configuration.model.js";
import employeeModel from "../models/employee.model";
import Employee from "../models/employee.model";

import listPreferencesService from "../services/listPreferences.service";
import activityService from "../services/activity.service";
import respUtil from "../utils/resp.util";
import EmailService from "../services/email.service";
import serviceUtil from "../utils/service.util";
import { findOneAndUpdate } from "../auth/OAuthClient";
import { token } from "morgan";
import mongoose from "mongoose";
const emailService = new EmailService();

const controller = "FontSize";

/**
 *  multiDelete fontSize.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function multidelete(req, res, next) {
  logger.info(
    "Log:FontSize Controller:multidelete: query,body :" +
      JSON.stringify(req.query, req.body)
  );
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  if (req.body && req.body.selectedIds && req.body.selectedIds.length > 0) {
    await configurationModel.updateMany(
      { _id: { $in: req.body.selectedIds } },
      {
        $set: {
          active: false,
          updated: new Date(),
        },
      },
      { multi: true }
    );
  }
  req.entityType = "configuration";
  req.activityKey = "configurationDelete";
  // adding configuration delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
}

/**
 * Get configuration
 * @param req
 * @param res
 * @returns {details: FontSize}
 */
async function get(req, res) {
  logger.info(
    "Log:FontSize Controller:get: query :" + JSON.stringify(req.query)
  );
  await serviceUtil.checkPermission(req, res, "View", controller);
  res.json({
    details: req.configuration,
  });
}

/**
 * Get configuration list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {configuration: configuration, pagination: pagination}
 */
async function list(req, res, next) {
  let configuration;
  logger.info(
    "Log:FontSize Controller:list: query :" + JSON.stringify(req.query)
  );
  await serviceUtil.checkPermission(req, res, "View", controller);
  const query = await serviceUtil.generateListQuery(req);

  let roleDetails = {};
  req.entityType = "configuration";

  query.dbfields = { password: 0, salt: 0, _v: 0 };
  if (req.query.type === "exportToCsv") {
    query.limit =
      query.pagination.totalCount > 200 ? 200 : query.pagination.totalCount;
  }
  configuration = await configurationModel.list(query);

  // total count
  query.pagination.totalCount = await configurationModel.totalCount(query);

  res.json({
    configuration: configuration,
    pagination: query.pagination,
  });
}

/**
 * Load configuration and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.configuration = await configurationModel.get(
    req.params.listPreferencesId
  );
  return next();
}

/**
 * Create new configuration
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info(
    "Log:FontSize Controller:create: body :" + JSON.stringify(req.body)
  );
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let configuration = new configurationModel(req.body);

  configuration = await listPreferencesService.setCreateConfigurationVariables(
    req,
    configuration
  );
  req.configuration = await configurationModel.saveData(configuration);

  /**@Update the Employee Record add listPreference Key */
  let findEmployee = await employeeModel.findOne({
    _id: req.tokenInfo._id,
    active: true,
  });
  if (findEmployee) {
    findEmployee.configuration = req.configuration._id;
    await employeeModel.saveData(findEmployee);
  }
  req.entityType = "configuration";
  req.activityKey = "configurationCreate";

  // adding configuration create activity
  activityService.insertActivity(req);
  res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing configuration
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info(
    "Log:FontSize Controller:update: body :" + JSON.stringify(req.body)
  );
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let configuration = req.configuration;
  configuration.employeeId = req.tokenInfo._id;

  req.description = await serviceUtil.compareObjects(configuration, req.body);

  configuration.columnOrder = { ...req.body.columnOrder };
  configuration.employeeId = req.tokenInfo._id.toString();
  configuration = await listPreferencesService.setUpdateConfigurationVariables(
    req,
    configuration
  );

  req.configuration = await configurationModel.saveData(configuration);
  req.entityType = "configuration";
  req.activityKey = "configurationUpdate";

  // adding configuration update activity
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Delete configuration.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info(
    "Log:FontSize Controller:remove: query :" + JSON.stringify(req.query)
  );
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let configuration = req.configuration;
  const empId = mongoose.Types.ObjectId(configuration.employeeId);
  const userId = mongoose.Types.ObjectId(req.tokenInfo._id);
  if (!empId.equals(userId)) {
    req.i18nKey = "onlyDeleteOwnTableViews";
    return res.json(respUtil.getErrorResponse(req));
  }
  configuration.active = false;
  configuration = await listPreferencesService.setUpdateConfigurationVariables(
    req,
    configuration
  );
  req.configuration = await configurationModel.saveData(configuration);
  req.entityType = "configuration";
  req.activityKey = "fconfigurationDelete";

  // adding configuration delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
}

async function updateFontSize(req, res, next) {
  logger.info(
    "Log:FontSize Controller:create: body :" + JSON.stringify(req.body)
  );
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let configuration = new configurationModel(req.body);
  const employeeId = req.tokenInfo._id.toString();

  // Check if record exists
  let existingFontSize = await configurationModel.findOne({
    active: true,
    employeeId: employeeId,
  });

  if (!existingFontSize) {
    // If not exists, create new
    configuration.employeeId = req.tokenInfo._id;
    let created = await configurationModel.saveData(configuration);

    // Insert activity
    req.entityType = "configuration";
    req.activityKey = "configurationCreate";
    req.description = "Created new font size configuration";
    req.configuration = created;
    await activityService.insertActivity(req);

    return res.json({
      respCode: 201,
      respMessage: "Configure Font Size created successfully",
    });
  } else {
    // If exists, update record
    const description = await serviceUtil.compareObjects(
      existingFontSize,
      req.body
    );
    // Update only the necessary fields
    Object.assign(existingFontSize, req.body);
    existingFontSize.employeeId = req.tokenInfo._id;

    let updated = await configurationModel.saveData(existingFontSize);
    req.entityType = "configuration";
    req.activityKey = "fontSizeUpdate";
    req.description = description;
    req.configuration = updated;
    await activityService.insertActivity(req);

    return res.json({
      respCode: 201,
      respMessage: "screen configuration updated successfully",
    });
  }
}

async function updateConfigurationsForAll(req, res, next) {
  logger.info(
    "Log:Configurations Controller:create: body :" + JSON.stringify(req.body)
  );
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let users = [];
  let entityType = req.query.entityType;
  if (entityType === "employee") {
    users = await Employee.find({ active: true });
  }

  // try{
  for (let user of users) {
    let userId = user._id;
    // Check if record exists
    let existingFontSize = await configurationModel.findOne({
      active: true,
      employeeId: userId,
    });

    if (!existingFontSize) {
      let configuration = new configurationModel(req.body);
      // If not exists, create new
      configuration.employeeId = userId;
      let created = await configurationModel.saveData(configuration);
      // Insert activity
      req.entityType = "configuration";
      req.activityKey = "configurationCreate";
      req.description = "Created new configuration";
      req.configuration = created;
      await activityService.insertActivity(req);
    } else {
      // If exists, update record
      const description = await serviceUtil.compareObjects(
        existingFontSize,
        req.body
      );
      // Update only the necessary fields
      Object.assign(existingFontSize, req.body);
      existingFontSize.employeeId = userId;

      let updated = await configurationModel.saveData(existingFontSize);
      req.entityType = "configuration";
      req.activityKey = "fontSizeUpdate";
      req.description = description;
      req.configuration = updated;
      await activityService.insertActivity(req);
    }
  }
  return res.json({
    respCode: 201,
    respMessage: "screen configuration updated successfully",
  });
}

export default {
  multidelete,
  get,
  list,
  load,
  create,
  update,
  remove,
  updateFontSize,
  updateConfigurationsForAll,
};

