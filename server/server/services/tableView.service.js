import TableView from "../models/tableView.model";

import session from "../utils/session.util";
/**
 * set TableView variables
 * @returns {TableView}
 */
const setCreateTableViewVariables = async (req, tableView) => {
  if (req.tokenInfo) {
    tableView.createdBy = session.getSessionLoginID(req);
    tableView.userId = session.getSessionLoginID(req);
    tableView.userName = session.getSessionLoginName(req);
    tableView.createdByName = session.getSessionLoginName(req);
    tableView.userEmail = session.getSessionLoginEmail(req);
  }

  tableView.created = Date.now();
  return tableView;
};

/**
 * set TableView update variables
 * @returns {TableView}
 */
const setUpdateTableViewVariables = async (req, tableView) => {
  if (req.tokenInfo) {
    tableView.updatedBy = session.getSessionLoginID(req);
    tableView.updatedByName = session.getSessionLoginName(req);
  }
  //replace_encryptedFields
  tableView.updated = Date.now();
  return tableView;
};




export default {
  setCreateTableViewVariables,
  setUpdateTableViewVariables,
};
