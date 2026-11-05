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
  widthType: {
    type : Boolean,
    default: true
  },
  // createdBy: {
  //   type: String
  // },
  active: {
    type: Boolean,
    default: true,
  },
  createdByName: String,
  updatedByName: String,
  columnOrder:Object,

  
          employeeId : {
            type: mongoose.Types.ObjectId,
            ref:"Employee"
          },
         

};



const ListPreferencesSchema = new mongoose.Schema(
  {
    ...defaultSchemaValues,
  },
  { usePushEach: true }
);

// ListPreferencesSchema.pre("validate", function (next) {
//   preValidatorSchema(this, next);

//   next();
// });

/**
 * Statics
 */
ListPreferencesSchema.statics = {
  /**
   * save and update listPreferences
   * @param listPreferences
   * @returns {Promise<ListPreferences, APIError>}
   */
  saveData(listPreferences) {
    return listPreferences.save().then((listPreferences) => {
      if (listPreferences) {
        return listPreferences;
      }
      const err = new APIError("Error in listPreferences", httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  /**
   * Get listPreferences
   * @param {ObjectId} id - The objectId of listPreferences.
   * @returns {Promise<ListPreferences, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((listPreferences) => {
        if (listPreferences) {
          return listPreferences;
        }
        const err = new APIError(
          "No such listPreferences exists!",
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  /**
   * List listPreferences in descending order of 'createdAt' timestamp.
   * @returns {Promise<ListPreferences[]>}
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
   * Count of listPreferences records
   * @returns {Promise<ListPreferences[]>}
   */
  totalCount(query) {
    return this.find(query.filter).countDocuments();
  },
};

/**
 * @typedef ListPreferences
 */
export default mongoose.model("ListPreferences", ListPreferencesSchema);
