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
  employeeName: String,
  // employeeID : String,
  fontSizeValue: String,
  active: {
    type: Boolean,
    default: true,
  },
  showGridLines: {
    type: Boolean,
    default: false,
  },
  stripedRows: {
    type: Boolean,
    default: true,
  },
  tableSize: String,
  fieldsPerRow: Number,
  fontSize: String,
  buttonStyle: String,
  paginationPosition: String,
  paginationCount: Number,
  screenColumns: {
    type: Number,
    default: 2
  },
  sideFormColumns: {
    type: Number,
    default: 1
  },
  fontSize: {
    type: String,
    default: "14px"
  },
  buttonStyle: {
    type: String,
    default: "square"
  },
  buttonRounded: Boolean,
  fontStyle: {
    type: String,
    default: "Poppins"
  },
  dateFormat: String,
  themeMode: String,
  createdByName: String,
  updatedByName: String,
  employeeId: {
    type: mongoose.Types.ObjectId
  },
};



const ConfigurationSchema = new mongoose.Schema(
  {
    ...defaultSchemaValues,
  },
  { usePushEach: true }
);

// ConfigurationSchema.pre("validate", function (next) {
//   preValidatorSchema(this, next);

//   next();
// });

/**
 * Statics
 */
ConfigurationSchema.statics = {
  /**
   * save and update fontSize
   * @param fontSize
   * @returns {Promise<Configuration, APIError>}
   */
  saveData(fontSize) {
    return fontSize.save().then((fontSize) => {
      if (fontSize) {
        return fontSize;
      }
      const err = new APIError("Error in fontSize", httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  /**
   * Get fontSize
   * @param {ObjectId} id - The objectId of fontSize.
   * @returns {Promise<Configuration, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((fontSize) => {
        if (fontSize) {
          return fontSize;
        }
        const err = new APIError(
          "No such fontSize exists!",
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  /**
   * List fontSize in descending order of 'createdAt' timestamp.
   * @returns {Promise<Configuration[]>}
   */
  list(query) {
    return this.find(query.filter, query.dbfields)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .collation({ locale: "en", strength: 2 })
      .exec();
  },
  /**
   * Count of fontSize records
   * @returns {Promise<Configuration[]>}
   */
  totalCount(query) {
    return this.find(query.filter).countDocuments();
  },
};

/**
 * @typedef Configuration
 */
export default mongoose.model("Configuration", ConfigurationSchema);
