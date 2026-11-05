import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;
/**
 * Activity Schema
 */
const ErrorSchema = new mongoose.Schema({
  contextType: String,
  desc: String,
  value: String,
  type: String,
  key: String,
  description: Array,
  loginFrom: String,
  loginType: String,
  contextId: { type: Schema.ObjectId },
  userId: { type: Schema.ObjectId, ref: 'User' },
  employeeId: { type: Schema.ObjectId, ref: 'Employee' },
  created: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  createdBy: {
    employee: { type: Schema.ObjectId, ref: 'Employee' },
    user: { type: Schema.ObjectId, ref: 'User' }
  },
  createdByName: String,
  updatedByName: String,
},
  {
    usePushEach: true
  });

/**
 * Statics
 */
ErrorSchema.statics = {
  /**
   * save and update error
   * @param error
   * @returns {Promise<error, APIError>}
   */
  saveData(error) {
    return error.save()
      .then((error) => {
        if (error) {
          return error;
        }
        const err = new APIError('Error in error', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
}
/**
* @typedef Error
*/
export default mongoose.model('Error', ErrorSchema);

