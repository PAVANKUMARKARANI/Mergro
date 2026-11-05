/**Model */
import emailStatusModel from '../models/emailstatus.model';
/**Util*/
import session from '../utils/session.util';

/**
 * set Emailstatus variables
 * @returns {emailStatusModel}
 */
const setCreateEmailstatusVaribles = async (req, emailstatus) => {
  if (req.tokenInfo) {
    emailstatus.userId = session.getSessionLoginID(req);
    emailstatus.createdByName = session.getSessionLoginName(req);
    emailstatus.status = "Pending";
    emailstatus.userEmail = session.getSessionLoginEmail(req);
  };
  emailstatus.created = Date.now();
  return emailstatus;
};


/**
 * set Emailstatus update variables
 * @returns {emailStatusModel}
 */
const setUpdateEmailstatusVaribles = async (req, emailstatus) => {
  emailstatus.updated = Date.now();
  if (req.tokenInfo) {
    emailstatus.updatedByName = session.getSessionLoginName(req);
  }

  return emailstatus;
};

export default {
  setCreateEmailstatusVaribles,
  setUpdateEmailstatusVaribles,
};