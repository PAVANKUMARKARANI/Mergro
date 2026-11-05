import exportToCsvViewsModel from "../models/exportToCsvViews.model";
import  mongoose from "mongoose";
import session from "../utils/session.util";
/**
 * set ExportToCsvViews variables
 * @returns {exportToCsvViewsModel}
 */
const setCreateExportToCsvViewsVariables = async (req, exportToCsvViews) => {
  if (req.tokenInfo) {
    exportToCsvViews.createdBy = session.getSessionLoginID(req);
    exportToCsvViews.userId = session.getSessionLoginID(req);
    exportToCsvViews.userName = session.getSessionLoginName(req);
    exportToCsvViews.createdByName = session.getSessionLoginName(req);
    exportToCsvViews.userEmail = session.getSessionLoginEmail(req);
  }

  exportToCsvViews.created = Date.now();
  return exportToCsvViews;
};

/**
 * set ExportToCsvViews update variables
 * @returns {exportToCsvViewsModel}
 */
const setUpdateExportToCsvViewsVariables = async (req, exportToCsvViews) => {
  if (req.tokenInfo) {
    exportToCsvViews.updatedBy = session.getSessionLoginID(req);
    exportToCsvViews.updatedByName = session.getSessionLoginName(req);
  }
  //replace_encryptedFields
  exportToCsvViews.updated = Date.now();
  return exportToCsvViews;
};

/** @applyCsvHashingToActions */
async function applyCsvHashingToActions(req, actions) {
  let findExportCsvFields;

  // Step 1: Validate viewId
  if (!req.query.viewId) return actions;

  // Step 2: Try to find with employeeId
  findExportCsvFields = await exportToCsvViewsModel.findOne({
    active: true,
    employeeId: req.tokenInfo._id,
    _id: mongoose.Types.ObjectId(req.query.viewId),
  });

  // Step 3: Fallback without employeeId
  if (!findExportCsvFields) {
    findExportCsvFields = await exportToCsvViewsModel.findOne({
      active: true,
      _id: mongoose.Types.ObjectId(req.query.viewId),
    });
  }

  // Step 4: Return original actions if no config found
  if (!findExportCsvFields) return actions;

  const allowedFields = [];

  if (
    Array.isArray(findExportCsvFields.encryptedFields) &&
    findExportCsvFields.encryptedFields.length > 0 &&
    Array.isArray(findExportCsvFields.fields)
  ) {
    const allFieldKeys = findExportCsvFields.fields.map((fieldObj) =>
      Object.keys(fieldObj)[0]
    );

    const uniqueFieldKeys = new Set(); // to avoid duplicates

    for (const key of allFieldKeys) {
      const isEncryptedFields = findExportCsvFields.encryptedFields.includes(key);
      if (!uniqueFieldKeys.has(key)) {
        allowedFields.push({
          key,
          encryptedFields: isEncryptedFields,
        });
        uniqueFieldKeys.add(key);
      }
    }

    console.log("Final allowedFields:", allowedFields);

    // Step 6: Apply field masking to each action
    for (let i = 0; i < actions.length; i++) {
      const newAction = {};
      const originalAction = actions[i];

      for (const { key, encryptedFields } of allowedFields) {
        if (originalAction[key] !== undefined) {
          newAction[key] = encryptedFields ? '#'.repeat(14) : originalAction[key];
        }
      }

      actions[i] = newAction;
    }
  }

  // Step 7: Return updated actions
  return actions;
}



export default {
  setCreateExportToCsvViewsVariables,
  setUpdateExportToCsvViewsVariables,
  applyCsvHashingToActions
};
