
/**
 * 
 * @return { ID}
 *  
 */
function getSessionLoginID(req) {
  return req.tokenInfo._id;
}

/**
 * 
 * @return { Email}
 *  
 */
function getSessionLoginID(req) {
  return req.tokenInfo._id;
}

/**
 * 
 * @return { Name}
 *  
 */
function getSessionLoginName(req) {
  return req.tokenInfo ? req.tokenInfo.name || req.tokenInfo.displayName : '';
}

/**
 * 
 * @return { Name}
 *  
 */
function getSessionLoginEmail(req) {
  return req.tokenInfo.email;
}

/**
 * 
 * @return {Comapany Name}
 *  
 */
function getSessionLoginCompanyName(req) {
  return req.tokenInfo.companyName
}

/**
 * 
 * @return {Comapany ID}
 *  
 */
function getSessionLoginCompanyID(req) {
  return req.tokenInfo.companyId;
}

/**
 * 
 * @return {Boolean}
 *  
 */
function checkPhoneNumberExists(req) {
  return req.tokenInfo && req.tokenInfo.phone;
}

/**
 * 
 * @return {Boolean}
 *  
 */
function checkUseTwoFactorEnable(req) {
  return req.tokenInfo && req.tokenInfo.twoFactor === "enable";
}

function getLoginType(req) {
  return req && req.tokenInfo ? req.tokenInfo.loginType : null;
}

function checkTokenInfo(req, field) {
  if (!field)
    return req && req.tokenInfo ? true : false;
  else
    return req && req.tokenInfo && req.tokenInfo[field] ? true : false;
}

function getTokenInfo(req, field) {
  if (!field)
    return req && req.tokenInfo ? req.tokenInfo : {};
  else
    return req && req.tokenInfo && req.tokenInfo[field] ? req.tokenInfo[field] : null;
}

export default {
  getSessionLoginID,
  getSessionLoginName,
  getSessionLoginEmail,
  getSessionLoginCompanyName,
  getSessionLoginCompanyID,
  checkPhoneNumberExists,
  checkUseTwoFactorEnable,
  checkTokenInfo,
  getTokenInfo,
  getLoginType
}