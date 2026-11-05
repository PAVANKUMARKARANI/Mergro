import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';

import APIError from '../helpers/APIError';

const Schema = mongoose.Schema;
/**
 * Role Schema
 */
const RoleSchema = new mongoose.Schema({
  // ,
  role: String,
  permissions: Object,
  // updated: Date,
  status: String,
  // created: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  // createdBy: { type: Schema.ObjectId, },
  // updatedBy: { type: Schema.ObjectId, },
  createdByName: String,
  updatedByName: String,
  "roleType" :{"type":"String"},"levels" :{"type":"Number"},"created" :{"type":"Date"},"updated" :{"type":"Date"},
}, { usePushEach: true });

/**
 * Statics
 */
RoleSchema.statics = {
  /**
   * save and update roles
   * @param roles
   * @returns {Promise<roles, APIError>}
   */
  saveData(role) {
    return role.save()
      .then((role) => {
        if (role) {
          return role;
        }
        const err = new APIError('Error in role', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get role
   * @param {ObjectId} id - The objectId of role.
   * @returns {Promise<role, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((role) => {
        if (role) {
          return role;
        }
        const err = new APIError('No such role exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List role in descending order of 'createdAt' timestamp.
   * @returns {Promise<role[]>}
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
   * Count of role records
   * @returns {Promise<role[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .countDocuments();
  },

  findUniqueRole(role) {
    return this.findOne({
      role: role,
      active: true
    })
      .exec()
      .then((role) => role);
  }

};

/**
 * @typedef role
 */
export default mongoose.model('Role', RoleSchema);
