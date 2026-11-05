import ConfigureScreens from "../models/configureScreens.model";

import session from "../utils/session.util";
import activityService from "./activity.service";
import path from "path";
import fs from "fs";
//replace_encryptedImport
//replace_serviceImport

let _ = require("lodash");
/**
 * set ConfigureScreens variables
 * @returns {ConfigureScreens}
 */
const setCreateConfigureScreensVariables = async (req, configureScreens) => {
  if (req.tokenInfo) {
    configureScreens.createdBy = session.getSessionLoginID(req);
    configureScreens.userId = session.getSessionLoginID(req);
    configureScreens.userName = session.getSessionLoginName(req);
    configureScreens.createdByName = session.getSessionLoginName(req);
    // configureScreens.status = "Pending";
    configureScreens.userEmail = session.getSessionLoginEmail(req);
    //replace_encryptedFields
    //replace_uniqueIdGeneration
  }

  configureScreens.created = Date.now();
  return configureScreens;
};

/**
 * set ConfigureScreens update variables
 * @returns {ConfigureScreens}
 */
const setUpdateConfigureScreensVariables = async (req, configureScreens) => {
  if (req.tokenInfo) {
    configureScreens.updatedBy = session.getSessionLoginID(req);
    configureScreens.updatedByName = session.getSessionLoginName(req);
  }
  //replace_encryptedFields
  configureScreens.updated = Date.now();
  return configureScreens;
};

/**@RelateAutoComplete for Bulk Upload */
const autoCompleteData = async (obj) => {
  let arrObj = [];
  for (let i of arrObj) {
    if (!i.isMultiple) {
      let query = {};
      query[i.searchField] = obj[i.bulkUploadField];
      query.active = true;
      obj[i.bulkUploadField] = await i.secureApi.findOne(query);
    } else {
      let resultarr = [];
      let searchFields = obj[i.bulkUploadField].split(",");
      for (let j of searchFields) {
        let query = { active: true };
        query[i.searchField] = j.trim();
        let findResult = await i.secureApi.findOne(query);
        if (findResult) resultarr.push(findResult);
      }
      obj[i.bulkUploadField] = resultarr;
    }
    if (obj && !obj[i.bulkUploadField])
      obj.reason = `${i.searchField} is not found`;
  }
  return obj;
};

/**
 * insert Employees bulk data
 * @returns {Employees}
 */
async function insertConfigureScreensData(req, res) {
  req.duplicates = [];
  let obj = req.obj;
  for (let val in obj) {
    try {
      obj[val] = await autoCompleteData(obj[val]);
      let configureScreens = new ConfigureScreens(obj[val]);
      configureScreens = await setCreateConfigureScreensVariables(req, configureScreens);
      let validateRes = await validateFields(req, configureScreens);
      if (validateRes) {
        obj[val].reason = req.errorMessage;
        req.duplicates.push(obj[val]);
        delete obj[val];
      }

      if (!validateRes) {
        req.configureScreens = await ConfigureScreens.saveData(configureScreens);
        req.entityType = "configureScreens";
        req.activityKey = "configureScreensCreate";
        await activityService.insertActivity(req);
      }
    } catch (err) {
      obj[val].reason = "Error while creating ConfigureScreens" + err;
      req.duplicates.push(obj[val]);
      delete obj[val];
    }
  }
  return obj;
}

const validateFields = async (req, configureScreens) => {
  let isError = false;

  //replaceRequiredFields
  return isError;
};

/**@Validate bulkupload fields with csv Headers */
const validateConfigureScreensBulkFields = async (req, res) => {
  let excelHeaders = req.headerKeys;
  let excelData = req.obj;
  req.duplicates = [];
  let bulkuploadFields = [[]];
  let unMatchedFields = _.difference(bulkuploadFields, excelHeaders);
  if (unMatchedFields && unMatchedFields.length > 0) {
    excelData = excelData.map((x) => ({ ...x, reason: "Headers not matched" }));
    req.duplicates = excelData;
    return {
      headersNotMatched: true,
      reason: `BulkUpload Fields (${unMatchedFields.join(
        ","
      )}) are Not Matched`,
    };
  }
  return { headersMatched: true };
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns extracted fileNames from the model folder for mac
 */
// const getFileNames = async (req, res) => {
//   const folderPath = path.join(__dirname, "../models");

//   return new Promise((resolve, reject) => {
//     fs.readdir(folderPath, (err, files) => {
//       if (err) {
//         console.error("Error reading folder:", err);
//         return reject(err);
//       }
//       // Remove ".model.js" from filenames
//       const cleanedFilenames = files
//         .filter(file => file.endsWith('.model.js'))
//         .map(file => file.replace('.model.js', ''));
//       console.log("Cleaned Filenames:", cleanedFilenames);
//       resolve(cleanedFilenames);
//     });
//   });
// };

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns for linux server
 */
const getFileNames = async (req, res) => {
  const folderPath = path.join(__dirname, "../models");

  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error("Error reading folder:", err);
        return reject(err);
      }
      console.log("Filenames:", files);
      // Filter out '._' files and remove '.model.js' suffix
      const cleanedFilenames = files
        .filter(file => file.endsWith('.model.js') && !file.startsWith('._'))
        .map(file => file.replace('.model.js', ''));
      console.log("Cleaned Filenames:", cleanedFilenames);
      resolve(cleanedFilenames);
    });
  });
};



export default {
  setCreateConfigureScreensVariables,
  setUpdateConfigureScreensVariables,
  insertConfigureScreensData,
  validateFields,
  validateConfigureScreensBulkFields,
  getFileNames
};
