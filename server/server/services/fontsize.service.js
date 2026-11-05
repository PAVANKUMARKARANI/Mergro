import fontSizeModel from "../models/fontSize.model";

import session from "../utils/session.util";
/**
 * set fontSizeModel variables
 * @returns {fontSizeModel}
 */
const setCreateFontSizeVariables = async (req, fontSize) => {
  if (req.tokenInfo) {
    fontSize.createdBy = session.getSessionLoginID(req);
    fontSize.userId = session.getSessionLoginID(req);
    fontSize.userName = session.getSessionLoginName(req);
    fontSize.createdByName = session.getSessionLoginName(req);
    fontSize.userEmail = session.getSessionLoginEmail(req);
  }

  fontSize.created = Date.now();
  return fontSize;
};

/**
 * set fontSizeModel update variables
 * @returns {fontSizeModel}
 */
const setUpdateFontSizeVariables = async (req, fontSize) => {
  if (req.tokenInfo) {
    fontSize.updatedBy = session.getSessionLoginID(req);
    fontSize.updatedByName = session.getSessionLoginName(req);
  }
  //replace_encryptedFields
  fontSize.updated = Date.now();
  return fontSize;
};




export default {
  setCreateFontSizeVariables,
  setUpdateFontSizeVariables,
};
