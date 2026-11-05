import requestIp from "request-ip";

import config from "../config/config";
/**Model*/
import tokenModel from "../models/token.model";
import settingsModel from "../models/settings.model";
/**Util*/
import serviceUtil from "../utils/service.util";
import { updateExpireTime } from "../middlewares/authenticate";
import Employee from "../models/employee.model";

require("dotenv").config();
const JWTSECRET = process.env.JWTSECRET;
const jwt = require("jsonwebtoken");

/**
 * Get unique token details by accessToken
 * @returns {token}
 */
const getTokenDetails = async (req, token) => {
  try {
    req.tokenData = await tokenModel.findOne({ accessToken: token });
    if (req.tokenData) {
      let entityType = req.tokenData.loginType;
      let email = req.tokenData.email;
      if (entityType === "employee") {
        req.details = await Employee.findUniqueEmail(email);
      }

      if (req.tokenData && req.tokenData._doc) {
        req.tokenData._doc.details = req.details;
      } else {
        req.tokenData.details = req.details;
      }

      return req.tokenData;
    }
  } catch (error) {
    return { error: "OK", err: error };
  }
};

const checkAdminOrigin = (req) => {
  const origin = req.headers.origin;
  if (origin) {
    var adminOrigin = origin.split("//")[1];
    adminOrigin = adminOrigin.split(".")[0];
    var isAdmin = ["admin", "localhost:3001"].includes(adminOrigin)
      ? true
      : false;
    return isAdmin;
  }
};

/**
 * set token variables
 * @returns {token}
 */
const setTokenVariables = async (req) => {
  let token = new tokenModel();
  let settings = await settingsModel.findOne({ active: true });
  token.accessToken = serviceUtil.generateUUID5();
  token.refreshToken = serviceUtil.generateUUID5();
  if (req.entityType) {
    token.loginType = req.entityType;
  }
  token.email = req.details.email;
  if (checkAdminOrigin(req)) {
    token.expires = new Date().getTime() + settings.adminExpireTokenTime;
  } else {
    token.expires = new Date().getTime() + settings.expireTokenTime;
  }

  if (req.body && req.body.type) {
    token.loginFrom = req.body.type;
  } else {
    token.loginFrom = "web";
  }
  if (req.body && req.body.deviceId) {
    token.deviceId = req.body.deviceId;
  }
  if (req.body && req.body.app_version && req.body.type === "ios") {
    token.iosMobileAppVersion = req.body.app_version;
    if (req.body.IOSVersion) {
      token.IOSVersion = req.body.IOSVersion;
    }
    if (req.body.Model) {
      token.IOSModel = req.body.Model;
    }
  } else if (req.body && req.body.app_version && req.body.type === "android") {
    token.androidMobileAppVersion = req.body.app_version;
    if (req.body.dev_version) {
      token.dev_version = req.body.dev_version;
    }
    if (req.body.Model) {
      token.AndroidModel = req.body.Model;
    }
  }
  req.token = token;
  req.isOTPEnabled = config.isOTPEnabled;
  // matching deviceId to users deviceInfo
  if (
    token &&
    token.loginFrom &&
    token.deviceId &&
    req.details &&
    req.details[token.loginFrom + "DeviceId"]
  ) {
    if (req.details[token.loginFrom + "DeviceId"] === token.deviceId) {
      req.isOTPEnabled = false;
    }
  }

  if (req && token && token.loginFrom && token.loginFrom === "web") {
    token.deviceId = requestIp.getClientIp(req);
  }
  if (req.body.deviceInfo) {
    let deviceInfo = req.body.deviceInfo;
    if (deviceInfo.browserName) {
      token.browserName = deviceInfo.browserName;
    }
    if (deviceInfo.osName) {
      token.osName = deviceInfo.osName;
    }
    if (deviceInfo.osVersion) {
      token.osVersion = deviceInfo.osVersion;
    }
    if (deviceInfo.deviceType) {
      token.deviceType = deviceInfo.deviceType;
    }
    if (deviceInfo.ipAddress) {
      token.ipAddress = deviceInfo.ipAddress;
    }
  }
};

/**
 * remove exisisting token and save new token
 * @param req
 * @returns {}
 */
const removeTokenAndSaveNewToken = async (req) => {
  let settings = await settingsModel.findOne({ active: true });
  if (settings && settings.disableMultipleLogin) {
    let token;
    let entityType = req.entityType || req.body.entityType;
    token = await tokenModel.findUniqueToken(req.details.email, entityType);
    req.details.password = undefined;
    req.details.salt = undefined;
    if (token && token.loginType) {
      if (token && token.loginType) {
        await updateExpireTime(token, "updateTime");
        req.token = token;
        // await Token.deleteOne(token);
      }
    } else {
      await setTokenVariables(req);
      tokenModel.saveData(req.token);
    }
  } else {
    await tokenModel.deleteMany({ email: req.details.email });
    await setTokenVariables(req);
    tokenModel.saveData(req.token);
  }

  // set token variables
  // save the token
};

const createJwtToken = async (req) => {
  let token = new tokenModel();
  if (req.entityType) token.loginType = req.entityType;
  let settings = await settingsModel.findOne({ active: true });
  let payload = { email: req.details.email };
  let expires = {
    expiresIn: `${settings.jwtExpireTokenTimeInmin}` * 60,
    algorithm: "HS256",
  };
  let jwttoken = jwt.sign(payload, JWTSECRET, expires);
  token.email = req.details.email;
  token.accessToken = jwttoken;
  token.expires = new Date().getTime() + expires.expiresIn * 60;
  if (req.body && req.body.type) token.loginFrom = req.body.type;
  else token.loginFrom = "web";
  if (req.body && req.body.deviceId) token.deviceId = req.body.deviceId;

  if (req.body && req.body.app_version && req.body.type === "ios") {
    token.iosMobileAppVersion = req.body.app_version;
    if (req.body.IOSVersion) token.IOSVersion = req.body.IOSVersion;
    if (req.body.Model) token.IOSModel = req.body.Model;
  } else if (req.body && req.body.app_version && req.body.type === "android") {
    token.androidMobileAppVersion = req.body.app_version;
    if (req.body.dev_version) token.dev_version = req.body.dev_version;
    if (req.body.Model) token.AndroidModel = req.body.Model;
  }
  req.isOTPEnabled = config.isOTPEnabled;
  // matching deviceId to users deviceInfo
  if (
    token &&
    token.loginFrom &&
    token.deviceId &&
    req.details &&
    req.details[token.loginFrom + "DeviceId"]
  ) {
    if (req.details[token.loginFrom + "DeviceId"] === token.deviceId) {
      req.isOTPEnabled = false;
    }
  }
  if (req && token && token.loginFrom && token.loginFrom === "web")
    token.deviceId = requestIp.getClientIp(req);
  if (req.body.deviceInfo) {
    let deviceInfo = req.body.deviceInfo;
    if (deviceInfo.browserName) token.browserName = deviceInfo.browserName;
    if (deviceInfo.osName) token.osName = deviceInfo.osName;
    if (deviceInfo.osVersion) token.osVersion = deviceInfo.osVersion;
    if (deviceInfo.deviceType) token.deviceType = deviceInfo.deviceType;
    if (deviceInfo.ipAddress) token.ipAddress = deviceInfo.ipAddress;
  }
  token.isJWTToken = true;
  req.token = token;
  await token.save();
};

const deleteToken = async (req) => {
  console.log(req.tokenData);
  if (req.tokenData && req.tokenData.accessToken) {
    await tokenModel.deleteOne({ accessToken: req.tokenData.accessToken });
  }
};

export default {
  getTokenDetails,
  setTokenVariables,
  removeTokenAndSaveNewToken,
  deleteToken,
};
