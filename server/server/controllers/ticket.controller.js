
import mongoose from 'mongoose';
/**Models*/
import ticketModel from '../models/ticket.model';
/**services*/
import activityService from '../services/activity.service';
import ticketService from '../services/tickets.service';
/**Utils*/
import i18nUtil from '../utils/i18n.util';
import serviceUtil from '../utils/service.util';
import respUtil from '../utils/resp.util';
import _ from 'lodash';

/**
 * Load Ticket and append to req.
 * @param req
 * @param res
 * @param next
 */

async function load(req, res, next) {
  req.ticket = await ticketModel.get(req.params.ticketId);
  return next();
}

/**
 * Get ticket
 * @param req
 * @param res
 * @returns {details: ticket}
 */
async function get(req, res) {
  logger.info('Log:filterModel Controller:get: query :' + JSON.stringify(req.query));
  req.query = await serviceUtil.generateListQuery(req);
  let ticket = req.ticket;
  logger.info('Log:ticket Controller:get:' + i18nUtil.getI18nMessage('recordFound'));
  let responseJson = {
    respCode: respUtil.getDetailsSuccessResponse().respCode,
    details: ticket
  };
  return res.json(responseJson);
}

/**
 * Create new ticket
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Ticket Controller:create: body :' + JSON.stringify(req.body));
  let ticket = new ticketModel(req.body);
  let lastTicket = await ticketModel.findOne({ active: true, ticketId: { $exists: true } }).sort({ created: -1 });
  if (lastTicket && lastTicket.ticketId){
		let lastNumber = parseInt(lastTicket.ticketId.replace('TK-', ''), 10);
		let newNumber = lastNumber + 1;
	  	let paddedNumber = newNumber < 10 ? `0${newNumber}` : `${newNumber}`;
		ticket.ticketId = `TK-${paddedNumber}`;
	}
	else{
		ticket.ticketId = 'TK-1';
	}
  ticket.status = 'New';
  ticket = await ticketService.setCreateTicketVariables(req, ticket);
  req.ticket = await ticketModel.saveData(ticket);
  req.entityType = 'ticket';
  req.activityKey = 'ticketCreate';
  activityService.insertActivity(req);
  logger.info('Log:tickets Controller:create:' + i18nUtil.getI18nMessage('ticketCreate'));
  return res.json(await respUtil.createSuccessResponse(req));
}

/**
 * Update existing filterModel
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:filterModel Controller:update: body :' + JSON.stringify(req.body));
  let ticket = req.ticket;
  req.description = await serviceUtil.compareObjects(ticket, req.body);

  ticket = Object.assign(ticket, req.body);
    if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'user') {
      ticket.updatedBy.user = req.tokenInfo._id;
    }
    if (req.tokenInfo.loginType === 'employee') {
      ticket.updatedBy.employee = req.tokenInfo._id;
    }
  }
  ticket.updated = new Date();
  req.ticket = await ticketModel.saveData(ticket);
  req.entityType = 'ticket';
  req.activityKey = 'ticketUpdate';
  activityService.insertActivity(req);
  logger.info('Log:tickets Controller:update:' + i18nUtil.getI18nMessage('ticketUpdate'));
  return res.json(await respUtil.updateSuccessResponse(req));
}

/**
* Get ticket list. based on criteria
* @param req
* @param res
* @param next
* @returns {tickets: tickets, pagination: pagination}
*/
async function list(req, res, next) {
  let responseJson = {};
  logger.info('log:Ticket Controller:list:query :' + JSON.stringify(req.query));
  const query = await serviceUtil.generateListQuery(req, "tickets");
  if (query && req.tokenInfo && req.tokenInfo.loginType && req.tokenInfo.loginType === "user") {
    query.filter.createdBy = { user: req.tokenInfo._id };
  }
  // total count
  query.pagination.totalCount = await ticketModel.totalCount(query);
  
  //get ticket records
  const tickets = await ticketModel.list(query);
  logger.info('Log:tickets Controller:list:' + i18nUtil.getI18nMessage('recordsFound'));
  responseJson.respCode = respUtil.getDetailsSuccessResponse().respCode;
  responseJson.tickets = tickets;
  responseJson.pagination = query.pagination;
  return res.json(responseJson);
}

/**
 * Delete ticket.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:ticket Controller:remove: query :' + JSON.stringify(req.query));
  const ticket = req.ticket;
  ticket.active = false;
  ticket.updated = Date.now();
  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'user') {
      ticket.updatedBy.user = req.tokenInfo._id;
    }
    if (req.tokenInfo.loginType === 'employee') {
      ticket.updatedBy.employee = req.tokenInfo._id;
    }
  }
  req.ticket = await ticketModel.saveData(ticket);
  req.entityType = 'ticket';
  req.activityKey = 'ticketDelete';
  activityService.insertActivity(req);
  logger.info('Log:tickets Controller:Delete:' + i18nUtil.getI18nMessage('ticketDelete'));
  return res.json(await respUtil.removeSuccessResponse(req));
}

/**
 * create reply tickets for existing Ticket
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function createReplyTicketsForTicket(req, res, next) {
  logger.info('Log:Ticket Controller:createReplyTicketsForTicket: body :' + JSON.stringify(req.body));
  let postedByQuery = {};
  if (req && req.query && req.query.ticketId && req.body.comments && req.body.comments[0] && req.body.comments[0].message) {
    if (req.tokenInfo && req.tokenInfo._id) {
      if (req.tokenInfo.loginType === 'user') {
        postedByQuery.user = req.tokenInfo._id;
      }
      if (req.tokenInfo.loginType === 'employee') {
        postedByQuery.employee = req.tokenInfo._id;
      }
    }
  }

  let newvalues = {
    $push: {
      comments: {
        $each: [{ _id: mongoose.Types.ObjectId(), message: req.body.comments[0].message, postedBy: postedByQuery }]
      }
    }
  };
  newvalues.updated = new Date();
  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'user') {
      newvalues.userLastUpdated = new Date();
      newvalues.status = 'Pending';
    }
    if (req.tokenInfo.loginType === 'employee') {
      newvalues.adminLastUpdated = new Date();
      newvalues.status = 'Answered';
      newvalues.assignedTo = req.tokenInfo._id;
    }
  }

  req.ticket = await ticketModel.replyTicket(req, newvalues);
  req.entityType = 'ticket';
  logger.info('Log:tickets Controller:createReplyTicketsForTicket:' + i18nUtil.getI18nMessage('ticketUpdate'));
  return res.json(await respUtil.updateSuccessResponse(req));
};

/**
* To get total count of tickets by each user
*/
async function numberOfTicketsByEachEmployee(req, res) {
  let o_id = mongoose.Types.ObjectId(req.query.id);
  let query = {
    "comments.postedBy.employee": o_id,
    adminLastUpdated: { $exists: true },
    "comments.created": {
      $lte: new Date()
    },
  };
  let ticketQuery = [
    {
      $match: query
    }, {
      $unwind: "$comments"
    },
    {
      $match: {
        "comments.created": {
          $lte: new Date()
        },
        "comments.postedBy.employee": o_id
      }
    },
    {
      $project: {
        created: "$comments.created", message: "$comments.message"
      }
    },
    { $sort: { created: -1, message: -1 } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$created" },
        },
        lastMessage: { $first: "$message" },
        "count": { $sum: 1 }
      },
    },
    { $sort: { _id: -1 } },
  ]
  let ticketCount = await ticketModel.getTicketCounts(ticketQuery);
  let responseJson = {
    respCode: respUtil.getDetailsSuccessResponse().respCode,
    details: ticketCount
  };
  return res.json(responseJson);
}

/**
 *  multiDelete ticket.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function multidelete(req, res, next) {
  logger.info('Log:Ticket Controller:multidelete: query,body :' + JSON.stringify(req.query, req.body));
  await serviceUtil.checkPermission(req, res, "Edit");
  if (req.body && req.body.selectedIds && req.body.selectedIds.length > 0) {
    await ticketModel.updateMany(
      { _id: { $in: req.body.selectedIds } },
      {
        $set: {
          active: false,
          updated: new Date()
        }
      },
      { multi: true }
    );
  }
  req.entityType = 'ticket';
  req.activityKey = 'ticketDelete';
  // adding ticket delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};


export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  multidelete,
  createReplyTicketsForTicket,
  numberOfTicketsByEachEmployee
};