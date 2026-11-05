/**Model*/
import menuListModel from '../models/menulist.model';
/**Utils*/
import sessionUtil from '../utils/session.util';

/**
 * set Menulist variables
 * @returns {menuListModel}
 */
const setCreateMenulistVaribles = async (req, menulist) => {
  if (req.tokenInfo) {
    menulist.userId = sessionUtil.getSessionLoginID(req);
    menulist.createdByName = sessionUtil.getSessionLoginName(req);
    menulist.status = "Pending";
    menulist.userEmail = sessionUtil.getSessionLoginEmail(req);
  };
  menulist.created = Date.now();
  return menulist;
};


/**
 * set Menulist update variables
 * @returns {menuListModel}
 */
const setUpdateMenulistVaribles = async (req, menulist) => {
  menulist.updated = Date.now();
  if (req.tokenInfo) {
    menulist.updatedByName = sessionUtil.getSessionLoginName(req);
  }
  return menulist;
};

export default {
  setCreateMenulistVaribles,
  setUpdateMenulistVaribles,
};