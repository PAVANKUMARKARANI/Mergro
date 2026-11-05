import Promise from "bluebird";
import mongoose from "mongoose";
import httpStatus from "http-status";
import APIError from "../helpers/APIError";
import string from "joi/lib/types/string";
import { getDynamicSchemaFields } from '../helpers/dynamicSchemaHelper';

const VersionsSchemaJson = require("../schemas/versions.json");
const Schema = mongoose.Schema;

/**
 * Default Scheamas
 */
let defaultSchemaValues = {
  contextId: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employees'
    }
  },
  versionName: String,
  releseDate: Date,
  versionChanges: String,
  attachments: Array,
  active: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.ObjectId,
  },
  createdByName: String,
  updatedByName: String,
};

/**
 * Versions Scnext();hema
 */

function preValidatorSchema(thisObj, next) {
  if (!thisObj) {
    const validationError = new APIError("failed to save user data.");
    validationError.name = "mongoFieldError";
    next(validationError);
  } else {
    //preRequired
    //preValidator
  }
}

const dynamicSchemaFields = getDynamicSchemaFields("versions", defaultSchemaValues, VersionsSchemaJson);

const VersionsSchema = new mongoose.Schema(
  {
    ...defaultSchemaValues,
    ...VersionsSchemaJson,
    ...dynamicSchemaFields
  },
  { usePushEach: true }
);

VersionsSchema.pre("validate", function (next) {
  preValidatorSchema(this, next);

  next();
});

/**
 * Statics
 */
VersionsSchema.statics = {
  /**
   * save and update versions
   * @param versions
   * @returns {Promise<Versions, APIError>}
   */
  saveData(versions) {
    return versions.save().then((versions) => {
      if (versions) {
        return versions;
      }
      const err = new APIError("Error in versions", httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  /**
   * Get versions
   * @param {ObjectId} id - The objectId of versions.
   * @returns {Promise<Versions, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((versions) => {
        if (versions) {
          return versions;
        }
        const err = new APIError(
          "No such versions exists!",
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  /**
   * List versions in descending order of 'createdAt' timestamp.
   * @returns {Promise<Versions[]>}
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
   * Count of versions records
   * @returns {Promise<Versions[]>}
   */
  totalCount(query) {
    return this.find(query.filter).countDocuments();
  },
};

/**
 * @typedef Versions
 */
export default mongoose.model("Versions", VersionsSchema);
