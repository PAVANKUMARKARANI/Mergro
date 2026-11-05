import Tickets from "../models/ticket.model";

import session from "../utils/session.util";
/**
 * set Tickets variables
 * @returns {Tickets}
 */
const setCreateTicketVariables = async (req, ticket) => {
  if (req.tokenInfo) {
    ticket.createdBy = session.getSessionLoginID(req);
    ticket.userId = session.getSessionLoginID(req);
    ticket.userName = session.getSessionLoginName(req);
    ticket.createdByName = session.getSessionLoginName(req);
    ticket.userEmail = session.getSessionLoginEmail(req);
  }

  ticket.created = Date.now();
  return ticket;
};

/**
 * set Tickets update variables
 * @returns {Tickets}
 */
const setUpdateTicketVariables = async (req, ticket) => {
  if (req.tokenInfo) {
    ticket.updatedBy = session.getSessionLoginID(req);
    ticket.updatedByName = session.getSessionLoginName(req);
  }
  //replace_encryptedFields
  ticket.updated = Date.now();
  return ticket;
};




export default {
  setCreateTicketVariables,
  setUpdateTicketVariables,
};
