const mongoose = require('mongoose');
/**@Models */
import ConfigureScreens from '../models/configureScreens.model';
import roleModel from '../models/roles.model.js';
import Employee from '../models/employee.model.js';

/**@Services */
import configureScreensService from '../services/configureScreens.service';
import activityService from '../services/activity.service';
import EmailService from '../services/email.service'

/**@Utils */
import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
import { createDescription, deleteDescription } from '../services/descriptions.service.js';
// import { addScreenFieldsToModel } from "../utils/getAllModelNames";
import path from "path";
import fs from "fs";
import { options } from 'joi';
import { first } from 'lodash';
const emailService = new EmailService()


const controller = "ConfigureScreens";

/**
 *  multiDelete configureScreens.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function multidelete(req, res, next) {
  logger.info('Log:ConfigureScreens Controller:multidelete: query,body :' + JSON.stringify(req.query, req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let configureScreens = []
  if (req.body && req.body.selectedIds && req.body.selectedIds.length > 0) { 
    configureScreens = await ConfigureScreens.find({ _id: { $in: req.body.selectedIds }, active:true})
    if (configureScreens !== null) {
      req.body.clinicId = (req.body && req.body.clinicId._id) ? req.body.clinicId._id : configureScreens.clinicId;
  }
    await ConfigureScreens.updateMany(
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
  req.description = await deleteDescription(configureScreens)
  req.entityType = 'configureScreens';
  req.activityKey = 'configureScreensDelete';
  // adding configureScreens delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

/**
 * Get configureScreens
 * @param req
 * @param res
 * @returns {details: ConfigureScreens}
 */
async function get(req, res) {
  logger.info('Log:ConfigureScreens Controller:get: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  res.json({
    details: req.configureScreens
  });
}// import { ConfigureScreens } from "mocha";


/**
 * Get configureScreens list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {configureScreens: configureScreens, pagination: pagination}
 */
async function list(req, res, next) {
  let configureScreens
  logger.info('Log:ConfigureScreens Controller:list: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  const query = await serviceUtil.generateListQuery(req, "configureScreens");
  const tokenData = req.tokenInfo
  query.dbfields = { password: 0, salt: 0, _v: 0 };
  if (req.query.type === 'exportToCsv') {
    query.limit = (query.pagination.totalCount > 200) ? 200 : query.pagination.totalCount
  }
  query.pagination.totalCount = await ConfigureScreens.totalCount(query);
  configureScreens = await ConfigureScreens.list(query); // textLowerCasePlural
  // }
  res.json({
    fieldconfigurationscreen: configureScreens,
    pagination: query.pagination
  });
}


/**
 * Load configureScreens and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.configureScreens = await ConfigureScreens.get(req.params.configureScreensId);
  return next();
}

/**
 * Create new configureScreens
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:ConfigureScreens Controller:create: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let configureScreens = new ConfigureScreens(req.body); // configureScreens // ConfigureScreensFirst
  let preCreateResult = await preCreate(configureScreens)

  let existingConfigureScreen = await ConfigureScreens.findOne({ name: req.body.name ,clinicId:req.body.clinicId, active: true });

  if (existingConfigureScreen) {
    req.i18nKey = 'configureScreenExists';
    logger.error('Error:ConfigureScreens Controller:create:' + req.errorMessage, controller);
    return res.json(respUtil.getErrorResponse(req));
  }

  configureScreens = await configureScreensService.setCreateConfigureScreensVariables(req, configureScreens);
  let preSaveCreateResult = await preSaveCreate(configureScreens)
  req.configureScreens = await ConfigureScreens.saveData(configureScreens);
  let postSaveCreateResult = await postSaveCreate(req.configureScreens)

  req.entityType = 'configureScreens';
  req.activityKey = 'configureScreensCreate';
  req.description = await createDescription(req.body)
  // adding configureScreens create activity
  activityService.insertActivity(req);
  res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing configureScreens
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:ConfigureScreens Controller:update: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let configureScreens = req.configureScreens;
  let beforeUpdate = Object.assign({}, configureScreens._doc)
  let preUpdateResult = await preUpdate(configureScreens)

  let existingConfigureScreen = await ConfigureScreens.findOne({
    name: req.body.screenName,
    _id: { $ne: configureScreens._id },
    active: true
  });

  if (existingConfigureScreen) {
    req.i18nKey = 'configureScreenExists';
    logger.error('Error:ConfigureScreens Controller:update:' + req.errorMessage, controller);
    return res.json(respUtil.getErrorResponse(req));
  }

  // configureScreens = Object.assign(configureScreens, req.body);
  const { __v, _id, ...safeBody } = req.body;
  configureScreens = Object.assign(configureScreens, safeBody);
  configureScreens = await configureScreensService.setUpdateConfigureScreensVariables(req, configureScreens);

  let preSaveUpdateResult = await preSaveUpdate(configureScreens)
  req.configureScreens = await ConfigureScreens.saveData(configureScreens);
  // req.configureScreens = await configureScreens.save();
  req.description = await serviceUtil.compareObjects(beforeUpdate, req.configureScreens._doc);
  let postSaveUpdateResult = await postSaveUpdate(req,configureScreens._doc)

  req.entityType = 'configureScreens';
  req.activityKey = 'configureScreensUpdate';
  req.body.clinicId = configureScreens.clinicId

  // adding configureScreens update activity
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Delete configureScreens.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:ConfigureScreens Controller:remove: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let configureScreens = req.configureScreens;
  let preRemoveResult = await preRemove(configureScreens)

  configureScreens.active = false;
  configureScreens = await configureScreensService.setUpdateConfigureScreensVariables(req, configureScreens);
  let preSaveRemoveResult = await preSaveRemove(configureScreens)
  req.configureScreens = await ConfigureScreens.saveData(configureScreens);
  let postSaveRemoveResult = await postSaveRemove(req.configureScreens)

  req.entityType = 'configureScreens';
  req.activityKey = 'configureScreensDelete';

  // adding configureScreens delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

/**
 * multiupdate configureScreens.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function multiupdate(req, res, next) {
  logger.info('Log:ConfigureScreens Controller:multiupdate: query,body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  if (req.body && req.body.selectedIds && req.body.selectedIds.length > 0 && req.body.updatedDetails) {
    await ConfigureScreens.updateMany({
      _id: { $in: req.body.selectedIds }
    },
      { $set: req.body.updatedDetails }
    )
  }
  req.entityType = 'configureScreens';
  req.activityKey = 'configureScreensUpdate';
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
}

const preCreate = async (configureScreens) => {
  /**@Add Your custom Logic */
}

const preSaveCreate = async (configureScreens) => {
  /**@Add Your custom Logic */
}

const postSaveCreate = async (configureScreens) => {
  /**@Add Your custom Logic */
}
const preUpdate = async (configureScreens) => {
  /**@Add Your custom Logic */
}

const preSaveUpdate = async (configureScreens) => {
  /**@Add Your custom Logic */
}

const preRemove = async (configureScreens) => {
  /**@Add Your custom Logic */
}

const preSaveRemove = async (configureScreens) => {
  /**@Add Your custom Logic */
}

const postSaveRemove = async (configureScreens) => {
  /**@Add Your custom Logic */
}


const applyConfigurationScreenChanges = async (req, res) => {
}

const updateScreenFieldsToConfigurationScreen = async (req, res) => {
  try {
    const fileNames = await configureScreensService.getFileNames(req, res); // Example: ["Pharmacies", "Parents"]
    const employees = await Employee.find({ active: true });
    for (const fileName of fileNames) {
      // Load schema file (Pharmacies.schema.json)
      const schemaFilePath = path.join(__dirname, `../formFieldsSchemas/${fileName}.json`);
      if (!fs.existsSync(schemaFilePath)) {
        console.warn(`Schema file not found for ${fileName}, skipping...`);
        continue;
      }
      const schemaJson = JSON.parse(fs.readFileSync(schemaFilePath, 'utf-8'));
      // Fetch screen fields array safely (handles case sensitivity)
      let fieldsArray;

      // if (fileName === 'reasons') {
      //   fieldsArray = schemaJson['Appt statuses'];
      // } else if(fileName == "txPlan"){
      //   fieldsArray = schemaJson['Tx plan'];
      // }
      // else {
        fieldsArray = schemaJson[fileName] || schemaJson[fileName.charAt(0).toUpperCase() + fileName.slice(1)];
      // }
      console.log("fileDaArray---->",fieldsArray);
      // Map fields exactly from schema
      const screenFields = fieldsArray.map((field, index) => ({
        name: field.name,
        label: field.label,
        placeholder: field.placeholder,
        serverFieldType: field.type,  // Dynamically set from schema
        type: field.type,
        // addFormOrder: index + 1,
        // editFormOrder: index + 1,
        required: field.required,
        displayinaddForm: !field.isAddFormHidden,
        displayineditForm: !field.isEditFormHidden,
        options: field.options ? field.options : "",
        show: field.show ? field.show : "",
        isMultiSelect: field.isMultiSelect
      }));

      for (const employee of employees) {
        // const clinics = await Clinics.find({ active: true, hospitalId: hospital._id });

        // for (const clinic of clinics) {
          // Prevent duplicate configuration screen creation
          const existing = await ConfigureScreens.findOne({
            employeeId: employee._id,
            // clinicId: clinic._id,
            name: fileName
          });

          if (existing) {
            console.log(`Configuration screen already exists for ${fileName} in clinic ${clinic._id}`);
            continue;
          }
          const configureScreen = new ConfigureScreens({
            clinicId: clinic._id,
            employeeId: employee._id,
            name: fileName,
            screenFields,
            active: true,
            createdBy: req.tokenInfo._id || null, // Optional
            createdByName: req.tokenInfo.name || req.tokenInfo.displayName || '', // Optional
            displayName: fileName === 'reasons' ? 'Appt statuses' : fileName
          });

          await configureScreen.save();
          console.log(`Created configuration screen for ${fileName} in clinic ${clinic._id}`);
        // }
      }
    }
    // if(isHospitalCreate){
    //   return {message: 'Configuration screens created successfully.'}
    // }else{
      res.json({ success: true, message: 'Configuration screens created successfully.' });
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Type mapping for mongoose data types
const typeMapping = {
  string: 'String',
  number: 'Number',
  boolean: 'Boolean',
  date: 'Date',
  array: 'Array',
  object: 'Object',
  objectid: 'ObjectId',
  checkbox: 'Boolean'
};

// Mongoose type mapping for runtime schema updates
const runtimeTypeMap = {
  'String': mongoose.Schema.Types.String,
  'Number': mongoose.Schema.Types.Number,
  'Boolean': mongoose.Schema.Types.Boolean,
  'Date': mongoose.Schema.Types.Date,
  'Array': mongoose.Schema.Types.Array,
  'Object': mongoose.Schema.Types.Mixed,
  'ObjectId': mongoose.Schema.Types.ObjectId
};

// Regex patterns for model name extraction
const modelNamePatterns = [
  /export\s+default\s+mongoose\.model\s*\(\s*["']([^"']+)["']/,
  /module\.exports\s*=\s*mongoose\.model\s*\(\s*["']([^"']+)["']/,
  /mongoose\.model\s*\(\s*["']([^"']+)["']/,
  /const\s+\w+\s*=\s*mongoose\.model\s*\(\s*["']([^"']+)["']/,
  /(var|let)\s+\w+\s*=\s*mongoose\.model\s*\(\s*["']([^"']+)["']/
];

/**
 * Extracts the model name from the model file content
 * @param {string} fileContent - The content of the model file
 * @returns {string|null} - The model name or null if not found
 */
const extractModelNameFromFile = (fileContent) => {
  for (let i = 0; i < modelNamePatterns.length; i++) {
    const pattern = modelNamePatterns[i];
    const match = fileContent.match(pattern);
    if (match) {
      // For var/let pattern, model name is in match[2], for others it's in match[1]
      return i === 4 ? match[2] : match[1];
    }
  }
  return null;
};

/**
 * Gets the mongoose data type for a field with proper validation
 * @param {object} field - The field object with type and properties
 * @returns {string} - The mongoose data type
 */
const getMongooseDataType = (field) => {
  if (!field || !field.type) {
    console.warn('Field or field.type is undefined, defaulting to String');
    return "String";
  }
  
  const fieldType = field.type.toLowerCase();
  
  if (fieldType === "dropdown") {
    return field.isMultiSelect ? "Array" : "String";
  }
  
  return typeMapping[fieldType] || "String";
};

/**
 * Updates the defaultSchemaValues in the model file with validation
 * @param {string} fileContent - Current file content
 * @param {Array} screenFields - Array of field configurations
 * @returns {string} - Updated file content
 */
const updateDefaultSchemaValues = (fileContent, screenFields) => {
  if (!Array.isArray(screenFields)) {
    throw new Error("screenFields must be an array");
  }

  const defaultSchemaRegex = /let defaultSchemaValues = \{([\s\S]*?)\};/;
  const match = fileContent.match(defaultSchemaRegex);

  if (!match) {
    throw new Error("defaultSchemaValues not found in the model file.");
  }

  let schemaContent = match[1];

  // Process each field with validation
  screenFields.forEach((field) => {
    if (!field || !field.name) {
      console.warn('Skipping invalid field:', field);
      return;
    }

    const fieldName = field.name;
    const mongooseType = getMongooseDataType(field);
    const fieldRegex = new RegExp(`\\b${fieldName}\\b\\s*:\\s*[^,]+,?`, "g");

    if (fieldRegex.test(schemaContent)) {
      schemaContent = schemaContent.replace(fieldRegex, `  ${fieldName}: ${mongooseType},`);
    } else {
      schemaContent = `  ${fieldName}: ${mongooseType},\n` + schemaContent;
    }
  });

  return fileContent.replace(
    defaultSchemaRegex,
    `let defaultSchemaValues = {\n${schemaContent}};`
  );
};

/**
 * Updates the runtime schema for an existing mongoose model with proper validation
 * @param {string} modelName - Name of the mongoose model
 * @param {Array} screenFields - Array of field configurations
 */
const updateRuntimeSchema = (modelName, screenFields) => {
  const Model = mongoose.models[modelName];
  if (!Model) return;

  if (!Array.isArray(screenFields)) {
    console.error('screenFields must be an array');
    return;
  }

  screenFields.forEach((field) => {
    if (!field || !field.name) {
      console.warn('Skipping invalid field:', field);
      return;
    }

    const fieldName = field.name;
    
    // Skip if field already exists in schema
    if (Model.schema.paths[fieldName]) return;

    const mongooseTypeString = getMongooseDataType(field);
    const mongooseType = runtimeTypeMap[mongooseTypeString] || mongoose.Schema.Types.String;
    
    const fieldDefinition = { type: mongooseType };
    
    // Add field properties if they exist and are valid
    // if (field.default !== undefined && field.default !== null) {
    //   fieldDefinition.default = field.default;
    // }
    // if (field.unique) fieldDefinition.unique = true;
    // if (field.index) fieldDefinition.index = true;
    
    // Special handling for Array fields to prevent null/undefined errors
    if (mongooseTypeString === 'Array') {
      fieldDefinition.default = field.default || [];
    }
    
    console.log("fieldDefinitions----->", fieldDefinition);
    
    try {
      Model.schema.add({ [fieldName]: fieldDefinition });
      console.log(`Added field '${fieldName}' to runtime schema for model '${modelName}'`);
    } catch (error) {
      console.error(`Error adding field '${fieldName}' to schema:`, error.message);
    }
  });
};

/**
 * Main function that updates both file and runtime schema with comprehensive validation
 * @param {object} configureScreens - Configuration object with model info
 * @param {string} modelFilePath - Path to the model file
 */
const updateModelFileAndSchema = async (configureScreens, modelFilePath) => {
  try {
    // Validate input parameters
    if (!configureScreens || !configureScreens.screenFields) {
      throw new Error('configureScreens or configureScreens.screenFields is undefined');
    }

    if (!Array.isArray(configureScreens.screenFields)) {
      throw new Error('configureScreens.screenFields must be an array');
    }

    // Read file content once
    const fileContent = fs.readFileSync(modelFilePath, "utf8");
    const modelName = extractModelNameFromFile(fileContent);
    
    if (!modelName) {
      throw new Error(`Could not extract model name from file: ${modelFilePath}`);
    }
    
    // Update file content
    // const updatedFileContent = updateDefaultSchemaValues(fileContent, configureScreens.screenFields);
    
    // // Write updated content back to file
    // fs.writeFileSync(modelFilePath, updatedFileContent, "utf8");
    console.log(`Updated defaultSchemaValues in file: ${modelFilePath}`);
    
    // Update runtime schema if model is already loaded
    updateRuntimeSchema(modelName, configureScreens.screenFields);
    
  } catch (error) {
    console.error(`Error in updateModelFileAndSchema: ${error.message}`);
    throw error;
  }
};

/**
 * Main entry point for post-save schema updates with enhanced error handling
 * @param {object} req - Request object (for future use)
 * @param {object} configureScreens - Configuration object with model info
 */
const postSaveUpdate = async (req, configureScreens) => {
  try {
    // Input validation
    if (!configureScreens || !configureScreens.screenName) {
      throw new Error('configureScreens or configureScreens.name is undefined');
    }
     function findModelFile(screenName) {
      const modelsDir = path.join(__dirname, "../models");

      // Step 1: normalize (lowercase, trim spaces)
      let normalized = screenName.trim().toLowerCase();

      // Step 2: handle plural/singular flexibly
      // If already ends with 's', allow with/without 's'
      // Otherwise, allow optional 's'
      let baseName = normalized.endsWith("s")
        ? normalized.slice(0, -1)
        : normalized;

      const regex = new RegExp(`^${baseName}s?\\.model\\.js$`, "i");

      // Step 3: scan models directory
      const files = fs.readdirSync(modelsDir);
      const match = files.find(file => regex.test(file));

      console.log("match----->", match, files);
      if (!match) {
        throw new Error(`Model not found for ${screenName}`);
      }

      return path.join(modelsDir, match);
    } 


    // Usage
    const modelFilePath = findModelFile(configureScreens.screenName);
    console.log(`Schema updated successfully for ${modelFilePath}`);
    // Check if file exists
    if (!fs.existsSync(modelFilePath)) {
      throw new Error(`Model file not found: ${modelFilePath}`);
    }
    await updateModelFileAndSchema(configureScreens, modelFilePath);
  } catch (error) {
    console.error(`Error in postSaveUpdate: ${error.message}`);
    console.error('Stack trace:', error.stack);
  }
};

/**
 * Utility function to clean up null/undefined array fields in existing documents
 * @param {string} modelName - Name of the mongoose model
 * @param {Array} arrayFields - Array of field names that should be arrays
 */
const cleanupArrayFields = async (modelName, arrayFields = []) => {
  try {
    const Model = mongoose.models[modelName];
    if (!Model) {
      console.warn(`Model ${modelName} not found`);
      return;
    }

    if (!Array.isArray(arrayFields) || arrayFields.length === 0) {
      console.log('No array fields to clean up');
      return;
    }

    const updateQuery = {};
    arrayFields.forEach(fieldName => {
      updateQuery[fieldName] = { $exists: false };
    });

    const setQuery = {};
    arrayFields.forEach(fieldName => {
      setQuery[fieldName] = [];
    });

    const result = await Model.updateMany(
      { $or: arrayFields.map(field => ({ [field]: { $in: [null, undefined] } })) },
      { $set: setQuery }
    );

    console.log(`Cleaned up ${result.modifiedCount} documents with null/undefined array fields`);
  } catch (error) {
    console.error(`Error cleaning up array fields: ${error.message}`);
  }
};

/**
 * Debug function to check data integrity
 * @param {string} modelName - Name of the mongoose model
 */
const debugModelData = async (modelName) => {
  try {
    const Model = mongoose.models[modelName];
    if (!Model) {
      console.warn(`Model ${modelName} not found`);
      return;
    }

    const sampleDoc = await Model.findOne().lean();
    if (sampleDoc) {
      console.log('Sample document structure:', JSON.stringify(sampleDoc, null, 2));
      
      // Check for null/undefined arrays
      Object.keys(sampleDoc).forEach(key => {
        if (sampleDoc[key] === null || sampleDoc[key] === undefined) {
          console.warn(`Field '${key}' is null/undefined in sample document`);
        }
      });
    }
  } catch (error) {
    console.error(`Error debugging model data: ${error.message}`);
  }
};






export default { multidelete, get, list, load, create, update, remove, multiupdate,
    applyConfigurationScreenChanges,updateScreenFieldsToConfigurationScreen
}