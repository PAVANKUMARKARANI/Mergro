import Promise from "bluebird";
import mongoose from "mongoose";
import httpStatus from "http-status";
import APIError from "../helpers/APIError";
import string from "joi/lib/types/string";

const Schema = mongoose.Schema;

/**
 * Default Scheamas
 */
let defaultSchemaValues = {
  created: {
    type: Date
  },
  updated: {
    type: Date
  },
  // createdBy: {
  //   type: String
  // },
  viewName: String,
  screenName : String,
  isDefault :{
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  key: Number,
  encryptedFields:Array,
  createdByName: String,  
  updatedByName: String,
  fields:Object,
  employeeId: {
    type: mongoose.Types.ObjectId,
    ref: "Employee"
  },
  isGlobal: {
    type: Boolean,
    default: false,
  }
};



const ExportToCsvViewsSchema = new mongoose.Schema(
  {
    ...defaultSchemaValues,
  },
  { usePushEach: true }
);

// ExportToCsvViewsSchema.pre("validate", function (next) {
//   preValidatorSchema(this, next);

//   next();
// });

/**
 * Statics
 */
ExportToCsvViewsSchema.statics = {
  /**
   * save and update exportToCsvViews
   * @param exportToCsvViews
   * @returns {Promise<ExportToCsvViews, APIError>}
   */
  saveData(exportToCsvViews) {
    return exportToCsvViews.save().then((exportToCsvViews) => {
      if (exportToCsvViews) {
        return exportToCsvViews;
      }
      const err = new APIError("Error in exportToCsvViews", httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  /**
   * Get exportToCsvViews
   * @param {ObjectId} id - The objectId of exportToCsvViews.
   * @returns {Promise<ExportToCsvViews, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((exportToCsvViews) => {
        if (exportToCsvViews) {
          return exportToCsvViews;
        }
        const err = new APIError(
          "No such exportToCsvViews exists!",
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  /**
   * List exportToCsvViews in descending order of 'createdAt' timestamp.
   * @returns {Promise<ExportToCsvViews[]>}
   */
  list(query) {
    return this.find(query.filter, query.dbfields)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .collation({ locale: "en", strength: 2})
      .exec();
  },
  /**
   * Count of exportToCsvViews records
   * @returns {Promise<ExportToCsvViews[]>}
   */
  totalCount(query) {
    return this.find(query.filter).countDocuments();
  },
};

/**
 * @typedef ExportToCsvViews
 */
export default mongoose.model("ExportToCsvViews", ExportToCsvViewsSchema);
