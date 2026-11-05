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



const TableViewSchema = new mongoose.Schema(
  {
    ...defaultSchemaValues,
  },
  { usePushEach: true }
);

// TableViewSchema.pre("validate", function (next) {
//   preValidatorSchema(this, next);

//   next();
// });

/**
 * Statics
 */
TableViewSchema.statics = {
  /**
   * save and update tableView
   * @param tableView
   * @returns {Promise<TableView, APIError>}
   */
  saveData(tableView) {
    return tableView.save().then((tableView) => {
      if (tableView) {
        return tableView;
      }
      const err = new APIError("Error in tableView", httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  /**
   * Get tableView
   * @param {ObjectId} id - The objectId of tableView.
   * @returns {Promise<TableView, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((tableView) => {
        if (tableView) {
          return tableView;
        }
        const err = new APIError(
          "No such tableView exists!",
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  /**
   * List tableView in descending order of 'createdAt' timestamp.
   * @returns {Promise<TableView[]>}
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
   * Count of tableView records
   * @returns {Promise<TableView[]>}
   */
  totalCount(query) {
    return this.find(query.filter).countDocuments();
  },
};

/**
 * @typedef TableView
 */
export default mongoose.model("TableView", TableViewSchema);
