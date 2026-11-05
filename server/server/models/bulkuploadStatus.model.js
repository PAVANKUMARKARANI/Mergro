import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const bulkuploadStatusSchemaJson = require('../schemas/bulkuploadStatus.json');
const Schema = mongoose.Schema;

/**
 * Default Scheamas
 */
let defaultSchemaValues = {
  csvFile: String,
  csvFilePath: String,
  duplicateFile: String,
  duplicateFilePath: String,
  duplicateFileDownloadUrl: String,
  status: String,
  total: { type: Number, default: 0 },
  success: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  type: String,
  createdBy: {
    type: Schema.ObjectId,
    ref: 'User'
  },
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
 * BulkuploadStatus Schema
 */
const BulkuploadStatusSchema = new mongoose.Schema({
  ...defaultSchemaValues,
  ...bulkuploadStatusSchemaJson
}, { usePushEach: true });

/**
 * Statics
 */
BulkuploadStatusSchema.statics = {
  /**
   * save and update new
   * @param new
   * @returns {Promise<BulkuploadStatus, APIError>}
   */
  saveData(bulkuploadStatus) {
    return bulkuploadStatus.save()
      .then((bulkuploadStatus) => {
        if (bulkuploadStatus) {
          return bulkuploadStatus;
        }
        const err = new APIError('Error in new', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get new
   * @param {ObjectId} id - The objectId of new.
   * @returns {Promise<BulkuploadStatus, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((bulkuploadStatus) => {
        if (bulkuploadStatus) {
          return bulkuploadStatus;
        }
        const err = new APIError('No such new exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List new in descending order of 'createdAt' timestamp.
   * @returns {Promise<BulkuploadStatus[]>}
   */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },
  /**
   * Count of new records
   * @returns {Promise<BulkuploadStatus[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .countDocuments();
  }

};

/**
 * @typedef BulkuploadStatus
 */
export default mongoose.model('BulkuploadStatus', BulkuploadStatusSchema);
