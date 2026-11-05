import Promise from 'bluebird';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import mongooseFloat from 'mongoose-float';
import { getDynamicSchemaFields } from '../helpers/dynamicSchemaHelper';
import APIError from '../helpers/APIError';

import templatesSchemaJson from '../schemas/templates.json';

const Float = mongooseFloat.loadType(mongoose);
const Schema = mongoose.Schema;

let defaultSchemaValues = {
  // serverAutoFields,
  name: String,
  templateType: String,
  entityType: String,
  subject: String,
  templateText: String,
  updated: Date,
  createdBy: {
    type: String
  },
  active: { type: Boolean, default: true },
  created: { type: Date, default: Date.now },
  createdByName: String,
  updatedByName: String,
  "created" :{"type":"Date"},"updated" :{"type":"Date"},
}
/**
 * templates Schema
 */
const dynamicSchemaFields = getDynamicSchemaFields("templates", defaultSchemaValues, templatesSchemaJson);

const TemplatesSchema = new mongoose.Schema(
  {
    ...defaultSchemaValues,
    ...templatesSchemaJson,
    ...dynamicSchemaFields
  },
  { usePushEach: true }
);
/**
 * Statics
 */
TemplatesSchema.statics = {
  /**
   * save and update templates
   * @param templates
   * @returns {Promise<Templates, APIError>}
   */
  saveData(templates) {
    return templates.save()
      .then((templates) => {
        if (templates) {
          return templates;
        }
        const err = new APIError('Error in user', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
    * List task in descending order of 'createdAt' timestamp.
    * @returns {Promise<Templates[]>}
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
    * Count of templates records
    * @returns {Promise<Templates[]>}
    */
  totalCount(query) {
    console.log(query)
    return this.find(query.filter)
      .countDocuments();
  },

  /**
     * Get templates
     * @param {ObjectId} id - The objectId of templates.
     * @returns {Promise<Templates, APIError>}
     */
  get(id) {
    return this.findById(id)
      .exec()
      .then((templates) => {
        if (templates) {
          return templates;
        }
        const err = new APIError('No such templates exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Find unique emailid.
   * @param {string} emailid.
   * @returns {Promise<templates[]>}
   */
  findUniqueTemplate(name) {
    return this.findOne({
      name: name,
      active: true
    })
      .exec()
      .then((templates) => {
        if (templates) {
          return templates;
        }
        const err = new APIError('No such templates exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
};

/**
 * @typedef Templates
 */
export default mongoose.model('Templates', TemplatesSchema);





