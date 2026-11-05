/**Config */
import config from "../config/config";

/**Models */
import activityModel from "../models/activity.model";
import rolesModel from "../models/roles.model";
import settingsModel from "../models/settings.model";
import listPreferencesModel from "../models/listPreferences.model";
import configurationModel from "../models/configuration.model";

import Employee from "../models/employee.model";

/**Services */
import activityService from "../services/activity.service";
import EmailService from "../services/email.service";
// import socketBeforeService from '../services/socket.before.service';
import tokenService from "../services/token.service";

/**Utils */
import dateUtil from "../utils/date.util";
import i18nUtil from "../utils/i18n.util";
import respUtil from "../utils/resp.util";
import serviceUtil from "../utils/service.util";
import sessionUtil from "../utils/session.util";
import OTPAuth from "otpauth";
import QRCode from "qrcode";
const crypto = require("crypto");
import Token from "../models/token.model";

const emailService = new EmailService();
import smsService from "../services/otp.service";
import {
  RESET_TOKEN_TTL_MS,
  clearResetToken,
  issueResetToken,
  verifyResetToken,
} from "../services/resetToken.service";
const controller = "Auth";
const validLoginTypes = ["user", "employee", "employee"];

/**
 * login response
 * @param req
 * @param res
 * @param user
 * @returns {*}
 */
async function loginResponse(req, res, user) {
  // remove exisisting token and save new token
  await tokenService.removeTokenAndSaveNewToken(req);
  const configurationData = await configurationModel.findOne({
    active: true,
    employeeId: req.details._id,
  });
  if (configurationData && configurationData.fontSizeValue) {
    req.fontSizeValue = configurationData;
  } else {
    req.fontSizeValue = null;
  }
  // adding login activity
  await activityService.insertActivity(req);
  return res.json(respUtil.loginSuccessResponse(req));
}

/**
 * login response
 * @param req
 * @param res
 * @param user
 * @returns {*}
 */
async function sendLoginResponse(req, res) {
  req.entityType = "user";
  // adding login activity
  await activityService.insertActivity(req);
  // send login user count to admin users by socket
  // if (req.entityType === 'user') {
  //   socketBeforeService.sendStatsForAdminDashboard({ data: { sendLiveUsers: true } });
  // };
  return res.json(respUtil.loginSuccessResponse(req));
}

async function checkDeviceInfo(req, details) {
  if (req.body.deviceInfo) {
    let count = 0;
    if (details.deviceName.length > 0) {
      for (let deviceInfo of details.deviceName) {
        if (
          deviceInfo.osName != req.body.deviceInfo.osName ||
          deviceInfo.browserType != req.body.deviceInfo.browserType ||
          deviceInfo.ipAddress != req.body.deviceInfo.ipAddress
        ) {
          count++;
        }
      }
    }
    if (count == details.deviceName.length) {
      if (details.deviceName.length < 1) {
        details.deviceName.push(req.body.deviceInfo);
        details.isDifferentDevice = false;
      } else {
        let randomNumber = await serviceUtil.generateRandomNumber(
          100000,
          999999
        );
        details.OTP = randomNumber;
        details.OTPDate = new Date();
        emailService.sendEmailviaGrid({
          templateName: config.emailTemplates.differentDeviceLoginConfirmation,
          emailParams: {
            to: req.body.email,
            displayName: details.displayName,
            osName: req.body.deviceInfo.osName,
            browserType: req.body.deviceInfo.browserType,
            searchEngine: req.body.deviceInfo.searchEngine,
            engineVersion: req.body.deviceInfo.engineVersion,
            ipAddress: req.body.deviceInfo.ipAddress,
            OTP: details.OTP,
          },
        });
        // smsService.sendSMS(details, config.messages.differentDeviceLogin)
        details.isDifferentDevice = true;
      }
      if (entityType === "employee") await Employee.saveData(req.details);
    }
  }
}
/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
async function login(req, res, next) {
  logger.info(
    "Log:Auth Controller:login: email :" + req.body.email, // never log the password
    controller
  );
  req.i18nKey = "loginError";

  let entityType = req.body.entityType;
  let email = req.body.email;

  if (!validLoginTypes.includes(entityType)) {
    req.i18nKey = "invalidLoginType";
    return res.json(respUtil.getErrorResponse(req));
  }

  // check email from datbase
  if (entityType === "employee") {
    req.details = await Employee.findUniqueEmail(email);
  }

  req.entityType = `${entityType}`;
  req.activityKey = `${entityType}LoginSuccess`;
  req.description = `${entityType} logged in`;
  if (!req.details) {
    req.i18nKey = "invalidEmail";
    return res.json(respUtil.getErrorResponse(req));
  }
  if (req.details && req.details.status && req.details.status !== "Active") {
    req.i18nKey = "activateYourAcount";
    return res.json(respUtil.getErrorResponse(req));
  }
  req.i18nKey = `${entityType}InactiveStatusMessage`;
  // check inactive status
  if (
    req.details &&
    req.details.status &&
    req.details.status === config.commonStatus.Inactive
  ) {
    logger.error(
      "Error:auth Controller:loginResponse:" +
        i18nUtil.getI18nMessage(req.i18nKey),
      controller
    );
    return res.json(respUtil.getErrorResponse(req));
  }

  // compare authenticate password
  if (!req.details.authenticate(req.body.password)) {
    req.i18nKey = "invalidPassword";
    logger.error(
      "Error:auth Controller:login:" + i18nUtil.getI18nMessage(req.i18nKey),
      controller
    );
    return res.json(respUtil.getErrorResponse(req));
  }

  /**@TwoFactorAuthentication */
  let settings = await settingsModel.findOne({ active: true });
  if (
    settings &&
    settings.isTwoFactorAuthentication &&
    settings.isTwoFactorAuthentication == true &&
    req.details.enableTwoFactAuth &&
    !checkRememberLoginValidity(req.details)
  ) {
    return res.json({
      isTwoFactorAuthentication: true,
      details: req.details,
    });
  }

  // checkDeviceInfo(req, req.details);

  let rolePermissions = await rolesModel.findUniqueRole(req.details.role);
  // return an error if employee role permissions is not found
  if (!rolePermissions) {
    req.i18nKey = "rolePermissionsNotFound";
    logger.error(
      "Error:Auth Controller:login:" + i18nUtil.getI18nMessage(req.i18nKey)
    );
    return res.json(respUtil.getErrorResponse(req));
  }
  console.log("roleleeeeeee");
  console.log(rolePermissions.permissions);
  let newobj = { rolePermissions: rolePermissions.permissions };
  // details.rolePermissions = rolePermissions.permissions;
  req.details = { ...req.details._doc, ...newobj };

  req.details.password = undefined;
  req.details.salt = undefined;
  req.details.resetPasswordTokenHash = undefined;
  req.details.resetPasswordExpires = undefined;
  req.details.base32Secrect = undefined;
  req.details.otp = undefined;
  req[entityType] = req.details;
  req.i18nKey = "loginSuccessMessage";
  loginResponse(req, res, req.details);
}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    user: req.user,
    num: Math.random() * 100,
  });
}

//log out for Admin and User
async function logout(req, res) {
  logger.info(
    "Log:Auth Controller:logout: query :" + JSON.stringify(req.query),
    controller
  );
  let responseJson = {};
  let activity = new activityModel();
  activity.type = "LOGOUT";
  // if (sessionUtil.getTokenInfo(req, 'loginType') === 'user') {
  //   activity.userId = sessionUtil.getTokenInfo(req, '_id');
  //   req.activityKey = 'userLogoutSuccess';
  // } else if (sessionUtil.getTokenInfo(req, 'loginType') === 'employee') {
  //   activity.employeeId = sessionUtil.getTokenInfo(req, '_id');
  //   req.activityKey = 'employeeLogoutSuccess';
  // }
  if (sessionUtil.getTokenInfo(req, "loginType") === "employee") {
    activity.employeeId = sessionUtil.getTokenInfo(req, "_id");
    req.activityKey = "employeeLogoutSuccess";
  }
  await tokenService.deleteToken(req);
  await activityService.insertActivity(req);
  responseJson = {
    details: req.Activity,
  };
  req.i18nKey = "logoutMessage";
  logger.info(
    "Log:auth Controller:logout:" + i18nUtil.getI18nMessage("logoutMessage"),
    controller
  );
  return res.json(respUtil.logoutSuccessResponse(req));
}

/**
 *
 *Sends the Email for the forgot password.
 */
async function forgotPassword(req, res) {
  let templateInfo = JSON.parse(JSON.stringify(config.mailSettings));

  //check for the account type if the account type does not exists throws the error.
  let entityType = req.body.entityType;
  if (req.body.entityType === "employee") {
    //Email exists check
    req.details = await Employee.findUniqueEmail(req.query.email);
    req.url = templateInfo.adminUrl;
  } else {
    req.i18nKey = "invalidLoginType";
    return res.json(respUtil.getErrorResponse(req));
  }
  if (!req.details) {
    req.i18nKey = "emailNotExist";
    logger.error(
      "auth",
      `Error:${req.body.entityType}:forgotPassword:'${i18nUtil.getI18nMessage(
        "emailNotExist"
      )}`
    );
    return res.json(respUtil.getErrorResponse(req));
  }
  if (
    req.details.forgotPasswordExpireTimeStamp &&
    req.details.forgotPasswordExpireTimeStamp >= new Date().getTime()
  ) {
    req.i18nKey = "emailAlreadySent";
    logger.error(
      "Error:user.Authorization Controller:forgotPassword:" +
        i18nUtil.getI18nMessage("emailNotExist"),
      "UserAuth"
    );
    return res.json(respUtil.getErrorResponse(req));
  }
  //Account status check
  if (req.details && req.details.status === config.commonStatus.Inactive) {
    logger.error(
      "auth",
      `Error:${req.body.entityType}:forgotPassword:'${i18nUtil.getI18nMessage(
        "employeeInactiveStatusMessage"
      )}`
    );
    req.i18nKey = `${req.body.entityType}InactiveStatusMessage`;
    return res.json(respUtil.getErrorResponse(req));
  }
  req.enEmail = serviceUtil.encodeString(req.details.email);
  // Single-use secret for the reset link; changeRecoverPassword rejects requests without it.
  const resetToken = issueResetToken(req.details, RESET_TOKEN_TTL_MS);
  const settings = await settingsModel.findOne({ active: true });
  req.details.forgotPasswordExpireTimeStamp =
    settings && settings.forgotEmailInterval
      ? new Date().getTime() + settings.forgotEmailInterval * 60 * 1000
      : new Date().getTime() + 5 * 60 * 1000;

  if (entityType === "employee") await Employee.saveData(req.details);

  //Send email link to reset the password
  emailService.sendEmailviaGrid({
    templateName: config.emailTemplates.adminForgetPassword,
    emailParams: {
      to: req.details.email,
      displayName: req.details.displayName,
      link: `${req.url}/changeRecoverPassword/${req.enEmail}?token=${resetToken}`,
    },
  });
  req.entityType = `${req.body.entityType}`;
  req.activityKey = `${req.body.entityType}ForgotPassword`;
  activityService.insertActivity(req);
  req.i18nKey = "mailSent";
  logger.info(
    "auth",
    `Log:${req.body.entityType}:forgotPassword:${i18nUtil.getI18nMessage(
      "mailSent"
    )}`
  );
  return res.json(respUtil.successResponse(req));
}

/**
 * Change the recover password or activate the account by setting the password.
 */
async function changeRecoverPassword(req, res) {
  if (req.body.enEmail) {
    req.body.deEmail = serviceUtil.decodeString(req.body.enEmail);
    logger.info(
      "auth",
      `Log:${req.body.entityType}:changeRecoverPassword: body :${req.body.deEmail}`
    );
  }
  let email = req.body.deEmail;
  let entityType = req.body.entityType;
  if (!validLoginTypes.includes(entityType)) {
    req.i18nKey = "invalidLoginType";
    return res.json(respUtil.getErrorResponse(req));
  }
  if (entityType === "employee") {
    req.details = await Employee.findUniqueEmail(email);
  }

  // email not exists
  if (!req.details) {
    req.i18nKey = "emailNotExist";
    logger.error(
      "auth",
      `Error:${
        req.body.entityType
      }:changeRecoverPassword:${i18nUtil.getI18nMessage("emailNotExist")}`
    );
    return res.json(respUtil.getErrorResponse(req));
  }
  // The emailed token proves the request came from the reset / invite link.
  if (!verifyResetToken(req.details, req.body.token)) {
    req.errorMessage = "This link is invalid or has expired. Request a new one.";
    return res.json(respUtil.getErrorResponse(req));
  }
  let passwordDetails = req.body;
  if (
    passwordDetails.newPassword &&
    !(passwordDetails.newPassword === passwordDetails.confirmPassword)
  ) {
    req.i18nKey = "passwordsNotMatched";
    logger.error(
      "auth",
      `Error:${
        req.body.entityType
      }:changeRecoverPassword:${i18nUtil.getI18nMessage("passwordsNotMatched")}`
    );
    return res.json(respUtil.getErrorResponse(req));
  } else if (!passwordDetails.newPassword) {
    req.i18nKey = "newPassword";
    logger.error(
      "auth",
      `Error:${
        req.body.entityType
      }:changeRecoverPassword:${i18nUtil.getI18nMessage("newPassword")}`
    );
    return res.json(respUtil.getErrorResponse(req));
  }
  req.details.password = passwordDetails.newPassword;
  clearResetToken(req.details);
  req.details.forgotPasswordExpireTimeStamp = undefined;
  // Setting a password from an invite link activates the account.
  if (req.details.status === "Invited") req.details.status = config.commonStatus.Active;
  if (entityType === "employee") await Employee.saveData(req.details);

  req.activityKey = `${req.body.entityType}ChangePassword`;
  req.entityType = `${req.body.entityType}`;
  activityService.insertActivity(req);
  req.i18nKey = "passwordReset";
  return res.json(respUtil.successResponse(req));
}

/**
 * Change Password
 * @param req
 * @param res
 */
async function changePassword(req, res) {
  logger.info(
    `Log:auth Controller:changePassword: query :${JSON.stringify(req.query)}`,
    controller
  );

  // let id = req.query.adminReset ? req.query._id : sessionUtil.checkTokenInfo(req, "_id") && sessionUtil.checkTokenInfo(req, "loginType") ? sessionUtil.getTokenInfo(req, "loginType") : null;
  let id = req.query.adminReset
    ? req.query._id
    : sessionUtil.checkTokenInfo(req, "_id") &&
      sessionUtil.checkTokenInfo(req, "loginType")
    ? sessionUtil.getTokenInfo(req, "_id")
    : null;

  let entityType = req.body.entityType;
  if (!validLoginTypes.includes(entityType) || !id) {
    req.i18nKey = "invalidLoginType";
    return res.json(respUtil.getErrorResponse(req));
  }
  let notFoundError = false;
  try {
    if (entityType === "employee") {
      req.details = await Employee.get(id);
    }
  } catch (error) {
    notFoundError = true;
  }

  let passwordDetails = req.body;
  if (notFoundError || !req.details) {
    req.i18nKey = "detailsNotFound";
    return res.json(respUtil.getErrorResponse(req));
  }

  // check new password exists
  if (passwordDetails.newPassword) {
    // check current password and new password are same
    if (
      passwordDetails.currentPassword &&
      passwordDetails.currentPassword === passwordDetails.newPassword
    ) {
      req.i18nKey = "currentOldSameMsg";
      logger.error(
        `Error:${entityType} Controller:changePassword:' ${i18nUtil.getI18nMessage(
          "currentOldSameMsg"
        )}`,
        controller
      );
      return res.json(respUtil.getErrorResponse(req));
    }

    // authenticate current password
    if (req.details.authenticate(passwordDetails.currentPassword)) {
      if (passwordDetails.newPassword === passwordDetails.confirmPassword) {
        req.details.password = passwordDetails.newPassword;
        if (entityType === "employee") await Employee.saveData(req.details);

        req.activityKey = `${entityType}ChangePassword`;
        req.entityType = `${req.body.entityType}`;
        activityService.insertActivity(req);
        req.i18nKey = "passwordSuccess";
        logger.info(
          `Log:${entityType} Controller:changePassword: ${i18nUtil.getI18nMessage(
            "passwordSuccess"
          )}`,
          controller
        );
        return res.json(respUtil.successResponse(req));
      } else {
        req.i18nKey = "passwordsNotMatched";
        logger.error(
          `Error:${entityType} Controller:changePassword:' ${i18nUtil.getI18nMessage(
            "passwordsNotMatched"
          )}`,
          controller
        );
        return res.json(respUtil.getErrorResponse(req));
      }
    } else {
      req.i18nKey = "currentPasswordError";
      logger.error(
        `Error:${entityType} Controller:changePassword:' ${i18nUtil.getI18nMessage(
          "currentPasswordError"
        )}`,
        controller
      );
      return res.json(respUtil.getErrorResponse(req));
    }
  } else {
    req.i18nKey = "newPassword";
    logger.error(
      `Error:${entityType} Controller:changePassword:' ${i18nUtil.getI18nMessage(
        "newPassword"
      )}`,
      controller
    );
    return res.json(respUtil.getErrorResponse(req));
  }
}

async function checkForgotPasswordLink(req, res) {
  if (!(req.query && req.query.token)) {
    return res.redirect(config.serverUrl + "html/expire.html");
  }
  let emailVerify = await EmailVerify.findOne({
    active: true,
    token: req.query.token,
    type: "forgotPassword",
    login: req.body.entityType,
  });
  if (!emailVerify) {
    return res.redirect(config.serverUrl + "html/expire.html");
  }
  if (!(emailVerify.expireTimeStamp > new Date().getTime())) {
    return res.redirect(config.serverUrl + "html/expire.html");
  }
  let user = await User.findUniqueEmail(emailVerify.email);
  // email not exists
  if (!user) {
    logger.error(
      "Error:user.Authorization Controller:changeRecoverPassword:" +
        i18nUtil.getI18nMessage("emailNotExist"),
      "UserAuth"
    );
    return res.redirect(config.serverUrl + "html/expire.html");
  }
  res.redirect(emailVerify.redirectUrl);
}
async function socialLogin(req, res) {
  let email = req.body.email;
  let entityType = req.body.entityType;
  if (!validLoginTypes.includes(entityType)) {
    req.i18nKey = "invalidLoginType";
    return res.json(respUtil.getErrorResponse(req));
  }

  if (entityType === "employee") {
    req.details = await employeeModel.findUniqueEmail(email);
    let employee = req.details;
    req.entityType = entityType;
    if (!employee) {
      employee = new employeeModel(req.body);
      employee._doc.status = "Active";
      employee._doc.role = "Employee";
      employee._doc.firstTimeLogin = true;
      employee._doc.created = Date.now();
      employee = await employeeModel.saveData(employee);
      req.details = employee;
      req.authEntityType = employee;
      req.activityKey = `${entityType}Create`;
      activityService.insertActivity(req);
    }
  }
  if (req.details) {
    let rolePermissions = await Roles.findUniqueRole(req.details.role);
    // return an error if employee role permissions is not found
    if (!rolePermissions) {
      req.i18nKey = "rolePermissionsNotFound";
      logger.error(
        "Error:Auth Controller:login:" + i18nUtil.getI18nMessage(req.i18nKey)
      );
      return res.json(respUtil.getErrorResponse(req));
    }
    console.log(rolePermissions.permissions);
    let newobj = { rolePermissions: rolePermissions.permissions };
    // details.rolePermissions = rolePermissions.permissions;
    req.details = { ...req.details._doc, ...newobj };
    req.details.password = undefined;
    req.details.salt = undefined;
    req[entityType] = req.details;
    req.activityKey = `${entityType}LoginSuccess`;
    req.i18nKey = "loginSuccessMessage";
    loginResponse(req, res, req.details);
  }
}

/**
 *
 * @param {*} req
 * @Body {email,type,phone}
 * @param {*} res
 * @returns Otp Sent Successfully (success case)
 */
async function sendOTP(req, res) {
  let { email, type, phone, entityType } = req.body;
  logger.info(
    `Log:auth Controller:Send OTP: body :${JSON.stringify(req.body)}`
  );
  if (email) {
    let findAuthUserDetails = await findEntityUser(req);
    let settings = await Settings.findOne({ active: true });
    let OTP = serviceUtil.generateRandomString(6, "#");
    let otpExpires =
      settings && settings.otpExpiryTimeInMin
        ? new Date().getTime() + settings.otpExpiryTimeInMin * 60 * 1000
        : new Date().getTime() + 10 * 60 * 1000;
    if (OTP && OTP.length == 6) {
      findAuthUserDetails.otp = OTP;
      findAuthUserDetails.otpExpires = otpExpires;
      findAuthUserDetails = await saveEntityUser(req, findAuthUserDetails);
      if (type == "email") {
        req.templateName = "sendOTP";
        req.emailParams = {
          to: findAuthUserDetails.email,
          OTP,
          displayName: findAuthUserDetails.FirstName,
        };
        await emailService.sendEmailviaGrid(req);
        await smsService.createOtpVerification({
          email: email,
          type: type,
          otp: OTP,
          expires: otpExpires,
        });
        req.i18nKey = "emailSent";
        req.activityKey = "otpSent";
        activityService.insertActivity(req);
        logger.info(
          `Log:auth Controller:OTP SENT SUCCESSFULLY IN EMAIL :${JSON.stringify(
            req.body
          )}`
        );
        return res.json(respUtil.successResponse(req));
      } else {
        let message = {
          otp: OTP,
          message: `Your OTP (One-Time Password) is: ${OTP}. Please use this code to login your account`,
          // TODO: send to the user's own phone; this test number comes from server/.env.
          to: process.env.SMS_OTP_TEST_NUMBER,
          smsProvider: "nexmo",
        };
        let sendResult = await smsService.sendSMS(message);
        await smsService.createOtpVerification({
          ...req.body,
          otp: OTP,
          expired: otpExpires,
        });
        if (sendResult.success) {
          req.i18nKey = "otpSent";
          req.activityKey = "otpSent";
          activityService.insertActivity(req);
          logger.info(
            "Log:auth Controller:OTP SENT SUCCESSFULLY (SMS): ,body :" +
              JSON.stringify(req.body)
          );
          return res.json(respUtil.successResponse(req));
        } else {
          req.activityKey = "failedToSentOtp";
          req.description = sendResult.message;
          activityService.insertActivity(req);
          logger.error(
            `Log:auth Controller: FAILED TO SEND OTP",` +
              JSON.stringify(req.body)
          );
          return res.json({
            errorCode: 9001,
            errorMessage: sendResult,
          });
        }
      }
    } else {
      req.i18nKey = "failedToProcess";
      logger.error(
        `Log: auth Controller, FAILED TO PROCESS YOUR REQUEST`,
        JSON.stringify(req.body)
      );
      return res.json(respUtil.getErrorResponse(req));
    }
  }
}

/**
 *
 * @param {*} req
 * @Body {Object => {email,otp, isRemember }}
 * @param {*} res
 * @returns { * LoginResponse }
 */

async function verifyOTP(req, res) {
  let { email, otp, isRemember, type } = req.body;
  if (email && otp) {
    let findAuthUserDetails = await findEntityUser(req, "email");
    if (findAuthUserDetails && findAuthUserDetails.otp === otp) {
      if (
        findAuthUserDetails.otp &&
        findAuthUserDetails.otpExpires < new Date().getTime()
      ) {
        req.i18nKey = "otpExpired";
        req.activityKey = "otpExpires";
        activityService.insertActivity(req);
        return res.json(respUtil.getErrorResponse(req));
      } else {
        req.details = findAuthUserDetails;
        let settings = await settingsModel.findOne({ active: true });
        if (isRemember) {
          (findAuthUserDetails.isRemember = true),
            (findAuthUserDetails.isRememberLogin = dateUtil.getFutureDate(
              settings.isRemember
            ));
          findAuthUserDetails = await saveEntityUser(req, findAuthUserDetails);
        }
        let rolePermissions = await Roles.findUniqueRole(req.details.role);
        if (!rolePermissions) {
          req.i18nKey = "rolePermissionsNotFound";
          logger.error(
            "Error:Auth Controller:login:" +
              i18nUtil.getI18nMessage(req.i18nKey)
          );
          return res.json(respUtil.getErrorResponse(req));
        }
        req.activityKey = "otpVerificationSuccess";
        activityService.insertActivity(req);
        req.details = {
          ...req.details._doc,
          rolePermissions: rolePermissions.permissions,
        };
        req.details.password = undefined;
        req.details.salt = undefined;
        req.details.otp = undefined;
        req.entityType = "employee";
        req.employee = req.details;
        req.i18nKey = "loginSuccessMessage";
        if (type == "Authenticator") {
          await generateQrReponse(req, res);
        } else {
          loginResponse(req, res, req.details);
        }
      }
    } else {
      req.i18nKey = "invalidOtp";
      req.activityKey = "otpVerficationFailed";
      activityService.insertActivity(req);
      return res.json(respUtil.getErrorResponse(req));
    }
  } else {
    req.i18nKey = "provideValidData";
    return res.json(respUtil.getErrorResponse(req));
  }
}

async function generateQrReponse(req, res) {
  let findAuthUserDetails = await findEntityUser(req, "email");
  let base32Secrect = generateBase32SecretKey(20);
  let qrImageUrl;
  findAuthUserDetails.base32Secrect = base32Secrect;
  findAuthUserDetails = await saveEntityUser(req, findAuthUserDetails);
  // Create a new TOTP object
  console.log("AUTHUSER>>>>>>>>>>>>>>>>>>>", findAuthUserDetails);
  let totp = new OTPAuth.TOTP({
    issuer: findAuthUserDetails.name,
    label: "demoproject29",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: base32Secrect,
  });
  let uri = totp.toString();
  // Generate QR code
  qrImageUrl = await QRCode.toDataURL(uri);

  return res.json({
    respCode: 200,
    qrCode: qrImageUrl,
    base32Secrect: base32Secrect,
  });
}

async function verifyAuthenticatorOTP(req, res) {
  let { email, otp, isRemember } = req.body;
  let findAuthUserDetails = await findEntityUser(req, "email");
  if (findAuthUserDetails && findAuthUserDetails.base32Secrect) {
    let base32Secrect = findAuthUserDetails.base32Secrect;
    let totp = new OTPAuth.TOTP({
      issuer: findAuthUserDetails.name,
      label: "demoproject29",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: base32Secrect,
    });
    let validationResult = totp.validate({ token: otp, window: 1 });
    if (validationResult !== null) {
      req.details = findAuthUserDetails;
      let settings = await settingsModel.findOne({ active: true });
      if (isRemember) {
        (findAuthUserDetails.isRemember = true),
          (findAuthUserDetails.isRememberLogin = dateUtil.getFutureDate(
            settings.isRemember
          ));
        findAuthUserDetails = await saveEntityUser(req, findAuthUserDetails);
      }
      let rolePermissions = await Roles.findUniqueRole(req.details.role);
      if (!rolePermissions) {
        req.i18nKey = "rolePermissionsNotFound";
        logger.error(
          "Error:Auth Controller:login:" + i18nUtil.getI18nMessage(req.i18nKey)
        );
        return res.json(respUtil.getErrorResponse(req));
      }
      req.activityKey = "otpVerificationSuccess";
      activityService.insertActivity(req);
      req.details = {
        ...req.details._doc,
        rolePermissions: rolePermissions.permissions,
      };
      req.details.password = undefined;
      req.details.salt = undefined;
      req.details.otp = undefined;
      req.details.base32Secrect = undefined;
      req.entityType = "employee";
      req.employee = req.details;
      req.i18nKey = "loginSuccessMessage";
      loginResponse(req, res, req.details);
    } else {
      res.json({ errorCode: 9001, errorMessage: "Ivalid OTP" });
    }
  }
}

function generateBase32SecretKey(length) {
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const randomBytes = crypto.randomBytes(length);
  let key = "";

  for (let i = 0; i < length; i++) {
    const byte = randomBytes.readUInt8(i);
    key += base32chars[byte % base32chars.length];
  }
  console.log("KEY>>>>>>>>", key);
  return key;
}

function checkRememberLoginValidity(authUser) {
  if (authUser.isRemember && authUser.isRememberLogin) {
    if (new Date() < new Date(authUser.isRememberLogin)) {
      authUser.isTwoFactorAuthentication = false;
      return true;
    }
  }
  authUser.isRemember = false;
  authUser.isTwoFactorAuthentication = true;
  return false;
}

async function findEntityUser(req, type) {
  let { email, entityType } = req.body;
  if (type && type == "email") {
    if (entityType === "employee") {
      return await Employee.findUniqueEmail(email);
    }
  } else {
    if (entityType === "employee") {
      return await Employee.findOne({ email, active: true });
    }
  }
}

async function saveEntityUser(req, authUserObj) {
  let { email, entityType } = req.body;
  if (entityType === "employee") {
    return await Employee.saveData(authUserObj);
  }
}

async function googlelogin(req, res) {
  let email = req.body.email;
  let entityType = req.body.entityType;
  if (!validLoginTypes.includes(entityType)) {
    req.i18nKey = "invalidLoginType";
    return res.json(respUtil.getErrorResponse(req));
  }
  if (entityType === "employee") {
    req.details = await Employee.findUniqueEmail(email);
  }

  if (!req.details) {
    let employee = req.details;
    req.entityType = entityType;
    if (!employee) {
      employee = new Employee();
      employee.email = email;
      employee._doc.status = "Active";
      employee._doc.role = "Employee";
      employee._doc.firstTimeLogin = true;
      employee._doc.created = Date.now();
      employee.isGoogleUser = true;
      employee.entityType = entityType;
      employee.photo = req.body.photoUrl;
      employee.name = req.body.name;
      /**@create ListPreference for individual login type */
      let newListPreference = new listPreferencesModel({
        columnOrder: config.columnOrder,
        employeeId: employee._id,
      });
      /**@Saving the ListPreference */
      let savedPreference = await listPreferencesModel.saveData(
        newListPreference
      );
      /**@Assign that Preference to User */
      employee.listPreferences = savedPreference._id;
      employee = await Employee.saveData(employee);
      req.details = employee;
      req.activityKey = `${entityType}Create`;
      activityService.insertActivity(req);
    }
  }
  if (req.details) {
    let rolePermissions = await Roles.findUniqueRole(req.details.role);
    if (!rolePermissions) {
      req.i18nKey = "rolePermissionsNotFound";
      logger.error(
        "Error:Auth Controller:login:" + i18nUtil.getI18nMessage(req.i18nKey)
      );
      return res.json(respUtil.getErrorResponse(req));
    }
    let newobj = { rolePermissions: rolePermissions.permissions };
    req.details = { ...req.details._doc, ...newobj };
    req[entityType] = req.details;
    req.activityKey = `${entityType}LoginSuccess`;
    req.i18nKey = "loginSuccessMessage";
    await googleloginResponse(req, res, req.details);
  }
}

async function googleloginResponse(req, res) {
  let oldtoken = await Token.findOne({ email: req.details.email });
  if (oldtoken) {
    await Token.deleteOne(oldtoken);
  }
  let token = new Token();
  token.email = req.body.email;
  token.tokenId = req.body.token;
  token.loginType = req.entityType;
  token.isGoogleToken = true;
  await token.save();
  let createsuccessObj = {
    responseCode: 200,
    accessToken: token.tokenId,
    refreshToken: token.refreshToken,
    details: req.details,
    respMessage: "Successfully logged in.",
  };
  return res.json(createsuccessObj);
}

async function googleLogout(req, res) {
  if (req.tokenData && req.tokenData.tokenId) {
    await Token.deleteOne({ tokenId: req.tokenData.tokenId });
  }
  req.i18nKey = "logoutMessage";
  logger.info(
    "Log:auth Controller:logout:" + i18nUtil.getI18nMessage("logoutMessage"),
    controller
  );
  return res.json(respUtil.logoutSuccessResponse(req));
}

export default {
  login,
  getRandomNumber,
  logout,
  loginResponse,
  sendLoginResponse,
  forgotPassword,
  changeRecoverPassword,
  changePassword,
  socialLogin,
  checkForgotPasswordLink,
  sendOTP,
  verifyOTP,
  verifyAuthenticatorOTP,
  googlelogin,
  googleLogout,
};

