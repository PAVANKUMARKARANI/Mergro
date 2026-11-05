import sessionUtil from '../utils/session.util';
/**
 * set role variables
 * @returns {role}
 */

const setCreateRoleVaribles = (req, role) => {
  if (sessionUtil.getSessionLoginID(req)) {
    role.createdBy = sessionUtil.getSessionLoginID(req);
    role.createdByName = sessionUtil.getSessionLoginName(req);
  };
  role.created = Date.now();
  return role;
};

/**
 * set role update variables
 * @returns {user}
 */
const setUpdateRoleVaribles = (req, role) => {
  if (sessionUtil.getSessionLoginID(req)) {
    role.updatedBy = sessionUtil.getSessionLoginID(req);
    role.updatedByName = sessionUtil.getSessionLoginName(req);
  };
  role.updated = Date.now();
  return role;
}

export default {
  setCreateRoleVaribles,
  setUpdateRoleVaribles,
}