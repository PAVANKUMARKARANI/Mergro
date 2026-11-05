import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const menuListSchemaJson = require('../schemas/menulist.json');
const Schema = mongoose.Schema;

/**
 * Default Scheamas
 */
let defaultSchemaValues = {
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  type: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    default: "Active"
  },
  active: {
    type: Boolean,
    default: true
  },
  createdByName: String,
  updatedByName: String,
};


/**
 * Menulist Schema
 */
const MenulistSchema = new mongoose.Schema({
  ...defaultSchemaValues,
  ...menuListSchemaJson
}, { usePushEach: true });

/**
 * Statics
 */
MenulistSchema.statics = {
  /**
   * save and update menulist
   * @param menulist
   * @returns {Promise<Menulist, APIError>}
   */
  saveData(menulist) {
    return menulist.save()
      .then((menulist) => {
        if (menulist) {
          return menulist;
        }
        const err = new APIError('Error in menulist', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get menulist
   * @param {ObjectId} id - The objectId of menulist.
   * @returns {Promise<Menulist, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((menulist) => {
        if (menulist) {
          return menulist;
        }
        const err = new APIError('No such menulist exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List menulist in descending order of 'createdAt' timestamp.
   * @returns {Promise<Menulist[]>}
   */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .collation({ locale: "en", strength: 2})
      .exec();
  },
  /**
   * Count of menulist records
   * @returns {Promise<Menulist[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .countDocuments();
  }

};

/**
 * @typedef Menulist
 */
export default mongoose.model('Menulist', MenulistSchema);
