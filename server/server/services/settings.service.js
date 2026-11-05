/**Model*/
import settingsModel from '../models/settings.model';
/**Util*/
import sessionUtil from '../utils/session.util';

/**
 * set settings variables
 * @returns {settings}
 */

const setCreateSettingsVaribles = (req, settings) => {
  if (sessionUtil.checkTokenInfo(req, "_id")) {
    if (sessionUtil.getTokenInfo(req, "loginType") === 'employee') {
      settings.createdBy = sessionUtil.getTokenInfo(req, "_id");
      settings.createdByName = session.getSessionLoginName(req);
    }
  }
  return settings;
}

/**
 * set settings update variables
 * @returns {user}
 */
const setUpdateSettingsVaribles = (req, settings) => {
  if (sessionUtil.checkTokenInfo(req, "_id")) {
    if (sessionUtil.getTokenInfo(req, "loginType") === 'employee') {
      settings.updatedBy = sessionUtil.getTokenInfo(req, "_id");
      settings.updatedByName = session.getSessionLoginName(req);
    }
  }
  settings.updated = Date.now();
  return settings;
}

const updateGlobalSettings = async () => {
  let settings = await settingsModel.findOne({ active: true });
  if (settings) {
    global.settings = settings;
  }
}
updateGlobalSettings();

export default {
  setCreateSettingsVaribles,
  setUpdateSettingsVaribles,
  updateGlobalSettings
}