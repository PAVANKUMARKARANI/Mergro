import listPreferencesModel from "../models/listPreferences.model";

import sessionUtil from "../utils/session.util";
/**
 * set ListPreferences variables
 * @returns {listPreferencesModel}
 */
const setCreateListPreferencesVariables = async (req, listPreferences) => {
  if (req.tokenInfo) {
    listPreferences.createdBy = sessionUtil.getSessionLoginID(req);
    listPreferences.userId = sessionUtil.getSessionLoginID(req);
    listPreferences.userName = sessionUtil.getSessionLoginName(req);
    listPreferences.createdByName = sessionUtil.getSessionLoginName(req);
    listPreferences.userEmail = sessionUtil.getSessionLoginEmail(req);
  }

  listPreferences.created = Date.now();
  return listPreferences;
};

/**
 * set ListPreferences update variables
 * @returns {listPreferencesModel}
 */
const setUpdateListPreferencesVariables = async (req, listPreferences) => {
  if (req.tokenInfo) {
    listPreferences.updatedBy = sessionUtil.getSessionLoginID(req);
    listPreferences.updatedByName = sessionUtil.getSessionLoginName(req);
  }
  //replace_encryptedFields
  listPreferences.updated = Date.now();
  return listPreferences;
};




export default {
  setCreateListPreferencesVariables,
  setUpdateListPreferencesVariables,
};
