import FormView from "../models/formView.model";

import session from "../utils/session.util";
/**
 * set FormView variables
 * @returns {FormView}
 */
const setCreateFormViewVariables = async (req, formView) => {
  if (req.tokenInfo) {
    formView.createdBy = session.getSessionLoginID(req);
    formView.userId = session.getSessionLoginID(req);
    formView.userName = session.getSessionLoginName(req);
    formView.createdByName = session.getSessionLoginName(req);
    formView.userEmail = session.getSessionLoginEmail(req);
  }

  formView.created = Date.now();
  return formView;
};

/**
 * set FormView update variables
 * @returns {FormView}
 */
const setUpdateFormViewVariables = async (req, formView) => {
  if (req.tokenInfo) {
    formView.updatedBy = session.getSessionLoginID(req);
    formView.updatedByName = session.getSessionLoginName(req);
  }
  //replace_encryptedFields
  formView.updated = Date.now();
  return formView;
};




export default {
  setCreateFormViewVariables,
  setUpdateFormViewVariables,
};
