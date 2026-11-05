import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import { getDynamicSchemaFields } from '../helpers/dynamicSchemaHelper';
import crypto from 'crypto';
import mongooseFloat from 'mongoose-float';
const Float = mongooseFloat.loadType(mongoose);

const Schema = mongoose.Schema;
const SchemaTypes = mongoose.Schema.Types;

import ticketSchemaJson from '../schemas/tickets.json';


let defaultSchemaValues = {
     assignedTo: {
                type: Schema.ObjectId,
                ref: 'Employees'
              },
  country: {
    type: String
  },
  createdBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employees'
    }
  },
  updatedBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employees'
    }
  },
  comments: [
    {
      message: String,
      created: {
        type: Date,
        default: Date.now
      }
    }
  ],
  created: {
    type: Date,
    default: Date.now
  },
  attachments: {type: Array},
  createdByName: String,
  updatedByName: String,
  "ticketId" :{"type":"String"},"subject" :{"type":"String"},"priority" :{"type":"String"},"category" :{"type":"String"},"status" :{"type":"String"},"screenOrModule" :{"type":"String"},"description" :{"type":"String"},"created" :{"type":"Date"},"updated" :{"type":"Date"},
}

/**
 * ticket Schema
 */
const dynamicSchemaFields = getDynamicSchemaFields("tickets", defaultSchemaValues, ticketSchemaJson);

const TicketSchema = new mongoose.Schema(
  {
    ...defaultSchemaValues,
    ...ticketSchemaJson,
    ...dynamicSchemaFields
  },
  { usePushEach: true }
);

TicketSchema.statics = {

  /**
   * save and update Ticket
   * @param Ticket
   * @returns {Promise<Ticket, APIError>}
   */
  saveData(ticket) {
    return ticket.save()
      .then((ticket) => {
        if (ticket) {
          return ticket;
        }
        const err = new APIError('error in ticket', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });

  },

  /**
 * List Ticket in descending order of 'createdAt' timestamp.
 * @returns {Promise<ticket[]>}
 */
  list(query) {
    return this.find(query.filter)
      .sort(query.sorting)
      .populate('assignedTo', 'name')
       .populate('assignedTo',"name ")      
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .collation({ locale: "en", strength: 2})
      .exec();
  },

  /**
 * Count of ticket records
 * @returns {Promise<ticket[]>}
 */
  totalCount(query) {
    return this.find(query.filter)
      .countDocuments();
  },

  /**
   * Get ticket
   * @param {ObjectId} id - The objectId of ticket.
   * @returns {Promise<ticket, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.user', 'firstname lastname userId userName profilePic')
      .populate('createdBy.employee', 'firstName lastName displayName profilePic')
      .populate('assignedTo', 'firstName lastName displayName profilePic')
      .populate('comments.postedBy.user', 'firstname lastname userId userName profilePic')
      .populate('comments.postedBy.employee', 'firstName lastName displayName profilePic')
      .exec()
      .then((ticket) => {
        if (ticket) {
          return ticket;
        }
        const err = new APIError('No such ticket exists', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      })
  },

  /**
   * Get LastTicket
   * @param {ObjectId} id - The objectId of ticket.
   * @returns {Promise<ticket, APIError>}
   */
  getLastTicket() {
    return this.findOne({ 'active': true })
      .sort({ 'created': -1 })
      .exec();
  },

  /**
   * reply to ticket
   * @param {ObjectId} id - The objectId of ticket.
   * @returns {Promise<ticket, APIError>}
   */
  replyTicket(req, newvalues) {
    return this.update({ '_id': req.query.ticketId }, newvalues)
      .exec();
  },

  /**
   * get tickets count based on users 
   * @returns {Promise<ticket[]>}
   */
  getTicketCounts(query) {
    return this.aggregate(query)
      .exec()
      .then((ticket) => {
        if (ticket) {
          return ticket;
        }
        const err = new APIError('No tickets exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
}

export default mongoose.model('Ticket', TicketSchema);
