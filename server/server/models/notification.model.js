import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';

import APIError from '../helpers/APIError';

import notificationSchemaJson from '../schemas/notification.json';

const Schema = mongoose.Schema;

let defaultSchemaValues = {
  active: {
    type: Boolean,
    default: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  isSend: {
    type: Boolean,
    default: false
  },
  createdByName: String,
  updatedByName: String,
};

/**
 * Notification Schema
 */
const NotificationSchema = new mongoose.Schema({
  ...defaultSchemaValues,
  ...notificationSchemaJson
}, { usePushEach: true });

/**
 * Statics
 */
NotificationSchema.statics = {
  /**
   * save and update notification
   * @param notification
   * @returns {Promise<Notification, APIError>}
   */
  saveData(notification) {
    return notification.save()
      .then((notification) => {
        if (notification) {
          return notification;
        }
        const err = new APIError('Error in notification', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get notification
   * @param {ObjectId} id - The objectId of notification.
   * @returns {Promise<Notification, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'dispalyName')
      .populate('createdBy.user', 'dispalyName')
      .populate('createdBy.hospital', 'dispalyName')
      .populate('createdBy.doctor', 'dispalyName')
      .exec()
      .then((notification) => {
        if (notification) {
          return notification;
        }
        const err = new APIError('No such notification exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List notification in descending order of 'createdAt' timestamp.
   * @returns {Promise<Notification[]>}
   */
  list(query) {
    return this.find(query.filter)
      .populate('createdBy.employee', 'dispalyName')
      .populate('createdBy.user', 'dispalyName')
      .populate('createdBy.hospital', 'dispalyName')
      .populate('createdBy.doctor', 'dispalyName')
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .collation({ locale: "en", strength: 2})
      .exec();
  },
  /**
   * Count of notification records
   * @returns {Promise<Notification[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .countDocuments();
  }

};

/**
 * @typedef Notification
 */
export default mongoose.model('Notification', NotificationSchema);
