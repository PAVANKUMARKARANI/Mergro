import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const emailstatusSchemaJson = require('../schemas/emailstatus.json');
const Schema = mongoose.Schema;

/**
 * Default Scheamas
 */
let defaultSchemaValues = {
  templateId: { type: Schema.ObjectId, ref: "Templates" },
  bcc: String,
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  },
  createdByName: String,
  updatedByName: String,
  
};


/**
 * Emailstatus Schema
 */
const EmailstatusSchema = new mongoose.Schema({
  ...defaultSchemaValues,
  ...emailstatusSchemaJson
}, { usePushEach: true });

/**
 * Statics
 */
EmailstatusSchema.statics = {
  /**
   * save and update emailstatus
   * @param emailstatus
   * @returns {Promise<Emailstatus, APIError>}
   */
  saveDetails(emailstatus) {
    return emailstatus.save()
      .then((emailstatus) => {
        if (emailstatus) {
          return emailstatus;
        }
        const err = new APIError('Error in emailstatus', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get emailstatus
   * @param {ObjectId} id - The objectId of emailstatus.
   * @returns {Promise<Emailstatus, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((emailstatus) => {
        if (emailstatus) {
          return emailstatus;
        }
        const err = new APIError('No such emailstatus exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List emailstatus in descending order of 'createdAt' timestamp.
   * @returns {Promise<Emailstatus[]>}
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
   * Count of emailstatus records
   * @returns {Promise<Emailstatus[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .countDocuments();
  }

};

/**
 * @typedef Emailstatus
 */
export default mongoose.model('Emailstatus', EmailstatusSchema);
