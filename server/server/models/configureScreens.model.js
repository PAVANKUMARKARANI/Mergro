import Promise from "bluebird";
import mongoose from "mongoose";
import httpStatus from "http-status";
import APIError from "../helpers/APIError";
import string from "joi/lib/types/string";
import { boolean } from "joi";

const ConfigureScreensSchemaJson = require("../schemas/configureScreens.json");
const Schema = mongoose.Schema;

/**
 * Default Scheamas
 */
let defaultSchemaValues = {
  active: {
    type: Boolean,
    default: true,
  },
  // clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinics' },
  // hospitalId: {
  //   type: Schema.ObjectId,
  //   ref: "Hospitals",
  // },
  employeeId: {
    type: Schema.ObjectId,
    ref: "Employee",
  },
  createdBy: {
    type: Schema.ObjectId,
  },
  createdByName: String,
  updatedByName: String,
  screenName:{
    type: String
  },
  allFields:{
    type:  [],
    default: [],
  },
  screenFields:{
    type:  [],
    default: [],
  },
  viewName:String,
  isGlobal : Boolean,
  isDefault : Boolean,
  created: Date,
  displayName: String
};


const fieldsSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {type: string},
  header:{type: string},
  placeholder: {type: string},
  serverFieldType: {type: string},
  type:{type: string},
  required: {type: Boolean},
  displayinaddForm: {type: Boolean},
  displayineditForm: {type: Boolean},
  addFormOrder: {type: Number},
  editFormOrder:{type: Number},
});

// let json = JSON.parse(JSON.stringify(ConfigureScreensSchemaJson));
// for(let i in json){
//   if(typeof json[i] == 'object' && json[i].match){
//     let substring = json[i].match;
//     substring = substring.substr(1,substring.length-3);
//     console.log(substring);
//     json[i].match = new RegExp(substring);
//   }
// }

/**
 * ConfigureScreens Scnext();hema
 */

function preValidatorSchema(thisObj, next) {
  if (!thisObj) {
    const validationError = new APIError("failed to save user data.");
    validationError.name = "mongoFieldError";
    next(validationError);
  } else {
    //preValidator
  }
}

const ConfigureScreensSchema = new mongoose.Schema(
  {
    ...defaultSchemaValues,
    ...ConfigureScreensSchemaJson,
  },
  { usePushEach: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, }
);

ConfigureScreensSchema.pre("validate", function (next) {
  preValidatorSchema(this, next);

  next();
});

/**
 * Statics
 */
ConfigureScreensSchema.statics = {
  /**
   * save and update configureScreens
   * @param configureScreens
   * @returns {Promise<ConfigureScreens, APIError>}
   */
  saveData(configureScreens) {
    return configureScreens.save().then((configureScreens) => {
      if (configureScreens) {
        return configureScreens;
      }
      const err = new APIError("Error in configureScreens", httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  /**
   * Get configureScreens
   * @param {ObjectId} id - The objectId of configureScreens.
   * @returns {Promise<ConfigureScreens, APIError>}
   */
  get(id) {
    return this.findById(id)

      .exec()
      .then((configureScreens) => {
        if (configureScreens) {
          return configureScreens;
        }
        const err = new APIError("No such configureScreens exists!", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List configureScreens in descending order of 'createdAt' timestamp.
   * @returns {Promise<ConfigureScreens[]>}
   */
  list(query) {
    return this.find(query.filter, query.dbfields)
      .collation({ locale: "en"})
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },
  /**
   * Count of configureScreens records
   * @returns {Promise<ConfigureScreens[]>}
   */
  totalCount(query) {
    return this.find(query.filter).countDocuments();
  },
};

/**
 * @typedef ConfigureScreens
 */
export default mongoose.model("ConfigureScreens", ConfigureScreensSchema);
