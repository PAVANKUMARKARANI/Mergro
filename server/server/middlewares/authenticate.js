import oauthServer from 'oauth2-server';
import config from '../config/config';
import mongoose from 'mongoose';
/**Models*/
import oauthModel from '../auth/models';
import settingsModel from '../models/settings.model';
import tokenModel from '../models/token.model';
import employeeModel from '../models/employee.model';
/**Services*/
import tokenService from '../services/token.service';
/**Utils*/
import serviceUtil from '../utils/service.util';
import sessionUtil from '../utils/session.util';
import respUtil from '../utils/resp.util';

const oauth = new oauthServer({ model: oauthModel });
const Request = oauthServer.Request;
const Response = oauthServer.Response;
require('dotenv').config();
const JWTSECRET = process.env.JWTSECRET;
const jwt = require('jsonwebtoken');

export async function updateExpireTime(token, type, req) {
  let settings = await settingsModel.findOne({ active: true });
  if (type === 'removeToken') {
    let deletedToken=await tokenModel.deleteOne({accessToken: token.accessToken})
  } else {
    await tokenModel.updateOne(
      { _id: mongoose.Types.ObjectId(token._id) },
      { $set: { expires: new Date().getTime() + settings.expireTokenTime, updated: new Date() } }
    );
  }
};


async function oauthToken(req, res, next) {
  var request = new Request(req);
  var response = new Response(res);
  oauth
    .token(request, response)
    .then(function (token) {
      req.token = token;
      req.user = token.user;
      next();
    }).catch(function (err) {
      return res.status(500).json(err);
    });
}

async function authenticate(options = {}) {
  return function (req, res, next) {
    var request = new Request({
      headers: { authorization: req.headers.authorization },
      method: req.method,
      query: req.query,
      body: req.body
    });
    var response = new Response(res);

    oauth.authenticate(request, response, options)
      .then(function (token) {
        // Request is authorized.
        req.tokenInfo = token.user;
        req.tokenInfo.loginType = 'user';
        next();
      })
      .catch(function (err) {
        // Request is not authorized.
        res.status(err.code || 500).json(err)
      });
  };
}

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();
async function googleTokenValidator(req,res){
  if(req.token){
    try {
      console.log("GOOOGLE VALDATOERRRRRR");
      const ticket = await client.verifyIdToken({
        idToken: req.token,
        audience: "126517528151-8gd8b176tlvj23frplph7g820g13s4e2.apps.googleusercontent.com", //CLient_ID
      });
      const payload = ticket.getPayload();
      const userid = payload['sub'];
      console.log("PAYLOAD:",payload);
      console.log("USERID:",userid);
      if(userid) {
        console.log("Token validation successful");
        console.log("User ID:", userid);
        return {respCode:200}
      }else {
        console.error("User ID not found in the payload");
        return { errorCode: 9001, errorMessage: "session expired" }
      }
    } catch (error) {
      return {errorCode:9001,errorMessage:"session expired" }
    }
  }else{
    if (config.isTokenNotPassed) {
      req.i18nKey = 'tokenNotProvideMessage';
      return res.json(respUtil.getErrorResponse(req));
    }
  }
}

/**
 * middleware b/w client and server
 */
async function isAllowed(req, res, next) {

  if (req.headers && req.headers.authorization) {
    req.token = serviceUtil.getBearerToken(req.headers);
  }
  if(req.token && req.token.length > 40){
    req.tokenData=await tokenModel.findOne({tokenId:req.token})
    if(req.tokenData){
      req.details = await employeeModel.findUniqueEmail(req.tokenData.email)
      req.tokenData.details = req.details;
    }
    req.tokenInfo=req.tokenData.details
    let result = await googleTokenValidator(req,res)
    if(result.errorCode){
      req.i18nKey = 'sessionExperied';
      return res.json(respUtil.getErrorResponse(req));
    }else{
      return next()
    }
  }else{
    let token = '';
      // get token from request headers
      if (req.headers && req.headers.authorization) {
        token = serviceUtil.getBearerToken(req.headers);
      }
      // get token from request query parameters
      if (req.query && req.query.token) {
        token = req.query.token;
      }
      if (token) {

        //gets the token details based on the access token
        let tokenData = await tokenService.getTokenDetails(req, token);
        // let tokenData = req.tokenData
        if (tokenData && tokenData._doc) {
          tokenData = tokenData._doc;
        }
        if (tokenData && tokenData.accessToken) {
          if (!(tokenData.expires < new Date().getTime())) {
            req.tokenInfo = tokenData.details;
            req.tokenInfo.loginType = tokenData.loginType;
            req.tokenInfo.loginFrom = tokenData.loginFrom;
            req.tokenInfo.iosMobileAppVersion = tokenData.iosMobileAppVersion;
            req.tokenInfo.androidMobileAppVersion = tokenData.androidMobileAppVersion;
            req.tokenInfo.browserName = tokenData.browserName;
            req.tokenInfo.osName = tokenData.osName;
            req.tokenInfo.osVersion = tokenData.osVersion;
            req.tokenInfo.deviceType = tokenData.deviceType;
            req.tokenInfo.ipAddress = tokenData.ipAddress;
            req.tokenInfo.permissions = await serviceUtil.getPermissions(req.tokenInfo.role);
            if (!req.tokenInfo.loginFrom) {
              req.tokenInfo.loginFrom = 'web';
            }
            await updateExpireTime(tokenData, 'updateTime');
            return next();
          } else {
            await updateExpireTime(tokenData, 'removeToken');
            req.i18nKey = 'sessionExperied';
            return res.json(respUtil.getErrorResponse(req));
          }
        } else {
          req.i18nKey = 'sessionExperied';
          return res.json(respUtil.getErrorResponse(req));
        }
      } else {
        if (config.isTokenNotPassed) {
          req.i18nKey = 'tokenNotProvideMessage';
          return res.json(respUtil.getErrorResponse(req));
        }
      }
      return next();
  }
}

async function jwtverification(req,res,next){
  let token = '';
  if (req.headers && req.headers.authorization) token = serviceUtil.getBearerToken(req.headers);
  if (req.query && req.query.token) token = req.query.token;
  if(token){
    let tokenData = await tokenService.getTokenDetails(req, token);
    if(tokenData && tokenData.accessToken){
      jwt.verify(tokenData.accessToken, JWTSECRET, (err, decoded) => {
        if (err) {
          console.error('Token verification failed:', err.message);
          req.i18nKey = 'sessionExperied';
          return res.json(respUtil.getErrorResponse(req));  
        }else{
          console.log('Decoded payload:', decoded);
          req.tokenInfo = tokenData._doc.details;
          req.tokenInfo.loginType = tokenData.loginType;
          req.tokenInfo.loginFrom = tokenData.loginFrom;
          req.tokenInfo.iosMobileAppVersion = tokenData.iosMobileAppVersion;
          req.tokenInfo.androidMobileAppVersion = tokenData.androidMobileAppVersion;
          req.tokenInfo.browserName = tokenData.browserName;
          req.tokenInfo.osName = tokenData.osName;
          req.tokenInfo.osVersion = tokenData.osVersion;
          req.tokenInfo.deviceType = tokenData.deviceType;
          req.tokenInfo.ipAddress = tokenData.ipAddress;
          if (!req.tokenInfo.loginFrom) {
            req.tokenInfo.loginFrom = 'web';
          }
          return next()
        }
      });
    }
  } 
  else {
    if (config.isTokenNotPassed) {
      req.i18nKey = 'tokenNotProvideMessage';
      return res.json(respUtil.getErrorResponse(req));
    }
  }
}

export default {
  isAllowed,
  oauthToken,
  authenticate,
  jwtverification
}
