/**Models */
import activityModel from '../models/activity.model';
// import ReqJson from '../models/reqJson.model';
/**Utils */
import activityUtil from '../utils/activity.util';
import serviceUtil from '../utils/service.util';
import sessionUtil from '../utils/session.util';

/**
 * set activity variables
 * @returns {activity}
 */
const setActivityVaribles = (req, activity) => {
  if (sessionUtil.checkTokenInfo(req, "_id")) {
    if (sessionUtil.getTokenInfo(req, "loginType") === 'activity')
      activity.createdBy.activity = sessionUtil.getTokenInfo(req, "_id");
  }
  return activity;
}

/**
 * insert activity
 * @returns {activity}
 */
const insertActivity = async (req) => {
  let activityConfig = activityUtil.activityConfig;
  let activity = new activityModel(activityConfig[req.activityKey]);
  if (req.contextId)
    activity.contextId = req.contextId;
  else if (req.entityType && req[req.entityType] && req[req.entityType]._id)
    activity.contextId = req[req.entityType]._id

  if (req.body && req.body.pair)
    activity.pair = req.body.pair;

  if (req.description)
    activity.description = req.description;

  if (activityConfig && activityConfig[req.activityKey]) {
    if (req.key === '401') {
      if (req.body && !req.body.type)
        req.body.type = "web";
      activity.loginFrom = req.body.type;
    }
    if (req.body && (req.body.email || req.body.emailid || req.query.email) && activity.contextType && (["LOGIN", "LOGINSUCCESS", "FORGOTPASSWORD", "REGISTER"].includes(activity.contextType))) {
      activity.email = req.body.email || req.body.emailid || req.query.email;
      let deviceInfo
      if(req.body.deviceInfo){
        deviceInfo = req.body.deviceInfo;
        activity.browserName = deviceInfo.browserName
        activity.osName = deviceInfo.osName
        activity.osVersion = deviceInfo.osVersion
        activity.deviceType = deviceInfo.deviceType
        activity.ipAddress = deviceInfo.ipAddress
      }
    }
    if (['employee'  ].includes(sessionUtil.getTokenInfo(req, "loginType"))) {
      // activity.createdBy['##controller'] = sessionUtil.getTokenInfo(req, "_id");
      if (!activity.contextId) {
        activity.contextId = sessionUtil.getTokenInfo(req, "_id");
      }
      activity.type = sessionUtil.getLoginType(req).toUpperCase();
      activity.email = sessionUtil.getTokenInfo(req, "email");
        activity.browserName = sessionUtil.getTokenInfo(req, "browserName");
        activity.osName = sessionUtil.getTokenInfo(req, "osName");
        activity.osVersion = sessionUtil.getTokenInfo(req, "osVersion");
        activity.deviceType = sessionUtil.getTokenInfo(req, "deviceType");
        activity.ipAddress = sessionUtil.getTokenInfo(req, "ipAddress");
    }
    if (req.body && req.url && sessionUtil.checkTokenInfo(req)) {
      let reqJson = {}
      reqJson.json = {};
      reqJson.url = req.originalUrl || '';
      reqJson.json.body = req.body || {};
      reqJson.json.params = req.query || {};
      reqJson.method = req.method;
      activity.requestJson = reqJson;
    }
    if (req.entityType && req.entityType === "templates" && req.templates) {
      activity.name = req.templates.name;
    }
    await activityModel.saveData(activity);
    return true;
  } else {
    return true;
  }
}

/**
 * get activities
 * @returns {activity}
 */
const getActivities = async (req, user) => {
  let query = await serviceUtil.generateListQuery(req);
  query.filter = { type: 'user', active: true, 'createdBy.user': user._id };
  if (query.page === 1)
    query.pagination.totalCount = await activityModel.totalCount(query);

  let activities = await activityModel.list(query);
  let activityObj = {
    pagination: query.pagination,
    details: activities
  };
  return activityObj;
}

export default {
  setActivityVaribles,
  insertActivity,
  getActivities
};
