import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';

import APIError from '../helpers/APIError';

import activytySchemaJson from '../schemas/activity.json';

const Schema = mongoose.Schema;

/**
 * Default Scheamas
 */
let defaultSchemaValues = {
  contextId: Schema.ObjectId,
  created: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  email: {
    type: String
  },
  createdBy: {
    employee: { type: Schema.ObjectId, ref: 'Employee' },
  },
  createdByName: String,
  updatedByName: String,
  
};

/**
 * Activity Schema
 */
const ActivitySchema = new mongoose.Schema({
  ...defaultSchemaValues,
  ...activytySchemaJson
}, { usePushEach: true });

/**
 * Statics
 */
ActivitySchema.statics = {
  /**
   * save and update activity
   * @param activity
   * @returns {Promise<Activity, APIError>}
   */
  saveData(activity) {
    return activity.save()
      .then((activity) => {
        if (activity) {
          return activity;
        }
        const err = new APIError('Error in activity', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get activity
   * @param {ObjectId} id - The objectId of activity.
   * @returns {Promise<Activity, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((activity) => {
        if (activity) {
          return activity;
        }
        const err = new APIError('No such activity exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List activity in descending order of 'createdAt' timestamp.
   * @returns {Promise<Activity[]>}
   */
  list(query) {
    return this.find(query.filter)
      .populate("createdBy.employee", 'firstName lastName displayName')
      .populate("createdBy.user", 'firstname lastname userName')
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .collation({ locale: "en", strength: 2})
      .exec();
  },

  historyList(query) {
    return this.find(query.filter, ({ _id: 0, description: 1 }))
      .sort(query.sorting)
      .skip(query.page - 1 * query.limit)
      .limit(query.limit)
      .exec();
  },
  /**
   * Count of activity records
   * @returns {Promise<Activity[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .countDocuments();
  }

};

/**
 * @typedef Activity
 */
export default mongoose.model('Activity', ActivitySchema);
