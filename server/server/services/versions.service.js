import versionsModel from "../models/versions.model";

import session from "../utils/session.util";

/**
 * set versionsModel variables
 * @returns {versionsModel}
 */
const setCreateVersionsVariables = async (req, versions) => {
  if (req.tokenInfo) {
    versions.createdBy = session.getSessionLoginID(req);
    versions.userId = session.getSessionLoginID(req);
    versions.userName = session.getSessionLoginName(req);
    versions.createdByName = session.getSessionLoginName(req);
    versions.userEmail = session.getSessionLoginEmail(req);
  }

  versions.created = Date.now();
  return versions;
};

/**
 * set versionsModel update variables
 * @returns {versionsModel}
 */
const setUpdateVersionsVariables = async (req, versions) => {
  if (req.tokenInfo) {
    versions.updatedBy = session.getSessionLoginID(req);
    versions.updatedByName = session.getSessionLoginName(req);
  }
  //replace_encryptedFields
  versions.updated = Date.now();
  return versions;
};


export default {
  setCreateVersionsVariables,
  setUpdateVersionsVariables,
};
