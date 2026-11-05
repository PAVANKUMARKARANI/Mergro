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
  name: String,
  screenName: String,
  isGlobal: {
    type: Boolean,
    default: false,
  },
  widthType: {
    type : Boolean,
    default: true
  },
  makeDefaultView: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdByName: String,
  updatedByName: String,
  columnOrder: Object,


  employeeId: {
    type: mongoose.Types.ObjectId,
    ref: "Employee"
  },


};



const FormViewSchema = new mongoose.Schema(
  {
    ...defaultSchemaValues,
  },
  { usePushEach: true }
);

// FormViewSchema.pre("validate", function (next) {
//   preValidatorSchema(this, next);

//   next();
// });

/**
 * Statics
 */
FormViewSchema.statics = {
  /**
   * save and update formView
   * @param formView
   * @returns {Promise<FormView, APIError>}
   */
  saveData(formView) {
    return formView.save().then((formView) => {
      if (formView) {
        return formView;
      }
      const err = new APIError("Error in formView", httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  /**
   * Get formView
   * @param {ObjectId} id - The objectId of formView.
   * @returns {Promise<FormView, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((formView) => {
        if (formView) {
          return formView;
        }
        const err = new APIError(
          "No such formView exists!",
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  /**
   * List formView in descending order of 'createdAt' timestamp.
   * @returns {Promise<FormView[]>}
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
   * Count of formView records
   * @returns {Promise<FormView[]>}
   */
  totalCount(query) {
    return this.find(query.filter).countDocuments();
  },
};

/**
 * @typedef FormView
 */
export default mongoose.model("FormView", FormViewSchema);
