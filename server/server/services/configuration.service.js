import configurationModel from "../models/configuration.model.js";

import session from "../utils/session.util";
/**
 * set configurationModel variables
 * @returns {configurationModel}
 */
const setCreateConfigurationVariables = async (req, configuration) => {
  if (req.tokenInfo) {
    configuration.createdBy = session.getSessionLoginID(req);
    configuration.userId = session.getSessionLoginID(req);
    configuration.userName = session.getSessionLoginName(req);
    configuration.createdByName = session.getSessionLoginName(req);
    configuration.userEmail = session.getSessionLoginEmail(req);
  }

  configuration.created = Date.now();
  return configuration;
};

/**
 * set configurationModel update variables
 * @returns {configurationModel}
 */
const setUpdateConfigurationVariables = async (req, configuration) => {
  if (req.tokenInfo) {
    configuration.updatedBy = session.getSessionLoginID(req);
    configuration.updatedByName = session.getSessionLoginName(req);
  }
  //replace_encryptedFields
  configuration.updated = Date.now();
  return configuration;
};




export default {
  setCreateConfigurationVariables,
  setUpdateConfigurationVariables,
};
