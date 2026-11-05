const iplocation = require("iplocation").default;
import randomstring from 'randomstring';
import randomNumber from 'random-number';

import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import requestIp from 'request-ip';

import config from '../config/config';
/**Util*/
import dateUtil from './date.util';
import sessionUtil from '../utils/session.util';
import respUtil from "../utils/resp.util";
/**Model*/
import rolesModel from "../models/roles.model";
import settingsModel from '../models/settings.model';
import mongoose from 'mongoose';
const randomString = require('random-base64-string');
const _ = require('lodash');
const moment = require('moment-timezone');
var fs = require("fs");

/**
 * generate UUID 5
 * @returns {token}
 */
const generateUUID5 = () => {
  const randomUUID4 = uuidv4();
  return uuidv5(randomstring.generate(), randomUUID4);
}

/**
 * get client ip
 * @param req
 * @returns {randomString}
 */
const getClientIp = (req) => {
  return requestIp.getClientIp(req);
}

/**
 * get bearer token
 * @returns {token}
 */
const getBearerToken = (headers) => {
  if (headers && headers.authorization) {
    const parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
}
/** Check Permissions for View or Edit */
const checkPermission = async (req, res, type, controller) => {
  let permissions = sessionUtil.checkTokenInfo(req, "permissions") ? sessionUtil.getTokenInfo(req, "permissions") : null;
  if (!permissions) return true;
  req.i18nKey = "noPermissionErr";
  if (!permissions[controller] && (permissions[controller] === "View" && [type].include(permissions[controller])) ||
    (permissions[controller] === "Edit" && ["Edit", "View"].include(permissions[controller]))) {
    return true
  } return;
};
/**
 * generate uuid
 * @returns {uuid}
 */
const generateUUID = () => {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

/**
 * generate random string
 * @param length
 * @param chars
 * @returns {randomString}
 */
const generateRandomString = (length, chars) => {
  let mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  let result = '';
  for (let i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
  return result;
}

/**
 * generate list query
 * @param req
 * @returns { filter: filter, sorting: sorting }
 */
const generateListQuery = async (req,ScreenName) => {
  let criteria = {
    limit: config.limit,
    page: config.page,
    sortfield: config.sortfield,
    direction: config.direction,
    filter: {},
    pagination: {}
  };
  let json;
  if (req.queryType === 'employee') {
    json = {};
  } else {
    json = {
      active: true
    };
  }

  let data;
  if (req.query) {
    data = req.query;
    if (data && data.limit) {
      criteria.limit = criteria.pagination.limit = parseInt(data.limit);
    }
    if (data && data.page) {
      criteria.page = criteria.pagination.page = parseInt(data.page);
    }
    if (data && data.filter) {
      let cred = JSON.parse(data.filter);
      if (cred.limit) {
        criteria.limit = criteria.pagination.limit = parseInt(cred['limit']) > 200 ? 200 : parseInt(cred['limit'])
      }
      if (cred.page) {
        criteria.page = criteria.pagination.page = parseInt(cred['page']);
      }
      if (cred.sortfield) {
        criteria.sortfield = cred['sortfield'];
      }
      if (cred.direction) {
        criteria.direction = cred['direction'];
      }
      if (cred && cred.globalSearch) {
        let globalObj = cred.globalSearch;
        if (globalObj && globalObj.type === 'user' && globalObj.value) {
          let allGlobalSearchFields=["email", "phone", "displayName", "address",
          "name", "gender", "employeeName", "role", "subject", "country", "packageName", "website","to","from", "contextType", "context", "desc","createdByName","status", "name","email","address","role","phone","reportingTo","created","updated","context","description","subject","status","roleType","levels","csvFile","duplicateFileDownloadUrl","createdByName","total","failed","success","type","to","from","bcc","html","templateName","reason","ticketId","priority","category","assignedTo","screenOrModule","updatedByName",]
          let uniqueScreensGlobalSearchFields={"employee":{"stringFields":["name","email","address","role","phone"],"numberFields":[],"dateFields":["created","updated"]},"activities":{"stringFields":[],"numberFields":[],"dateFields":[]},"emailtemplates":{"stringFields":[],"numberFields":[],"dateFields":["created","updated"]},"roles":{"stringFields":["roleType"],"numberFields":["levels"],"dateFields":["created","updated"]},"uploadhistory":{"stringFields":[],"numberFields":[],"dateFields":[]},"emailstatus":{"stringFields":[],"numberFields":[],"dateFields":[]},"tickets":{"stringFields":["ticketId","subject","priority","category","status","screenOrModule","description","createdByName","updatedByName"],"numberFields":[],"dateFields":["created","updated"]}}
          let numsArr = ["telegramId"];
          if (!json['$or']) {
            json['$or'] = [];
          }
          // numsArr.forEach(function (x) {
          //   let objarr = {
          //     $where: "/^.*" + globalObj.value + ".*/.test(this." + x + ")"
          //   }
          //   json['$or'].push(objarr)
          // });
          let filtersArr
          if(uniqueScreensGlobalSearchFields[ScreenName]){
            filtersArr=uniqueScreensGlobalSearchFields[ScreenName]
            // filtersArr=filtersArr.concat(["email", "phone", "displayName", "address",
            // "name", "gender", "employeeName", "role", "subject", "country", "packageName", "website","to","from", "contextType", "context", "desc","createdByName","status"])
          }else{
            filtersArr=allGlobalSearchFields
            filtersArr=filtersArr.concat(["email", "phone", "displayName", "address",
            "name", "gender", "employeeName", "role", "subject", "country", "packageName", "website","to","from", "contextType", "context", "desc","createdByName","status"])
          }
          console.log("SCREENFIELDS>>>>>>",uniqueScreensGlobalSearchFields[ScreenName])
          filtersArr['stringFields'].forEach(function (v) {
            if(typeof globalObj.value == "string"){
              let jsonNew = {};
              jsonNew[v] = { '$regex': globalObj.value, '$options': 'i' };
              json['$or'].push(jsonNew);
            }
          });
          filtersArr['numberFields'].forEach(function (v) {
            let value=parseFloat(globalObj.value)
            if(!isNaN(value)){
            let jsonNew = {};
            jsonNew[v] = (value)
            json['$or'].push(jsonNew);
            } 
          });
          filtersArr['dateFields'].forEach(function (v) {
            let dateRegex1 = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/;  // yyyy-mm-dd or yyyy-mm-dd HH:mm:ss
            let dateRegex3 = /^\d{4}\/\d{2}\/\d{2}( \d{2}:\d{2}(:\d{2})?)?$/; // yyyy/mm/dd or yyyy/mm/dd HH:mm:ss

            let datevalue, enddate;
            let value = globalObj.value ? globalObj.value.trim() : "";

            if (!value) return; // skip if empty value

            // Detect format yyyy-mm-dd or yyyy/mm/dd
            if (dateRegex1.test(value)) {
              datevalue = moment(value, "YYYY-MM-DD").toDate();
              enddate = moment(value, "YYYY-MM-DD").toDate();
            } else if (dateRegex3.test(value)) {
              datevalue = moment(value, "YYYY/MM/DD").toDate();
              enddate = moment(value, "YYYY/MM/DD").toDate();
            }

            // Handle DD-MM-YYYY or MM-DD-YYYY formats
            let parsedDate = moment(value, ["DD-MM-YYYY HH:mm:ss", "DD-MM-YYYY HH:mm", "DD-MM-YYYY"], true);
            if (!parsedDate.isValid()) {
              parsedDate = moment(value, ["MM-DD-YYYY HH:mm:ss", "MM-DD-YYYY HH:mm", "MM-DD-YYYY"], true);
            }

            if (parsedDate.isValid()) {
              datevalue = parsedDate.startOf('day').utc().toDate();
              enddate = parsedDate.endOf('day').utc().toDate();
            }

            if (datevalue && !isNaN(datevalue) && enddate && !isNaN(enddate)) {
              datevalue.setHours(0, 0, 0, 0);
              enddate.setHours(23, 59, 59, 999);

              let jsonNew = {};
              jsonNew[v] = { $gte: datevalue, $lte: enddate }; // inclusive range
              json['$or'].push(jsonNew);

            }
          });
        }
        if (globalObj && globalObj.type === 'employee' && globalObj.value) {
          let filtersArr = ["email", "phone", "displayName"];
          filtersArr.forEach(function (v) {
            if (!json['$or']) {
              json['$or'] = [];
            }
            let jsonNew = {};
            jsonNew[v] = { '$regex': globalObj.value, '$options': 'i' };
            json['$or'].push(jsonNew);
          });
        }
      }
      if (cred && cred.criteria) {
        let filters = cred.criteria;
        if (filters && filters.length > 0) {
          filters.forEach(function (v, i) {
            if (v.type === 'eq') {
              if (v.value && v.value instanceof Date) {
                json[v.key] = v.value;
              }
              else if (mongoose.Types.ObjectId.isValid(v.value)) {
                json[v.key] = v.value;
              }
              else if (typeof v.value == "number") {
                json[v.key] = v.value;
              }
              else if (typeof v.value == "boolean") {
                json[v.key] = v.value;
              }
              else if (typeof v.value == "object") {
                json[v.key] = v.value;
              }
              else {
                if (v.value) {
                  json[v.key] = v.value;
                }
              }
            }
            if (v.type === 'in') {
              if (Array.isArray(v.value))
                json[v.key] = { "$in": v.value };
              else if (v.value instanceof Date) {
                json[v.key] = v.value;
              }
              else if (mongoose.Types.ObjectId.isValid(v.value)) {
                json[v.key] = v.value;
              }
              else if (typeof v.value == "number") {
                json[v.key] = v.value;
              }
              else if (typeof v.value == "boolean") {
                json[v.key] = v.value;
              }
              else if (typeof v.value == "object") {
                json[v.key] = v.value;
              }
              else {
                if (v.value) {
                  json[v.key] = { $regex: v.value, $options: 'i' };
                }
              }
            }
            if (v.type === 'gte') {
              if(cred.isDateSearch){
                let datevalue=new Date(v.value); 
                if(datevalue && !isNaN(datevalue)){
                  datevalue.setUTCHours(0, 0, 0, 0)
                }
                if (!json[v.key]) {
                  json[v.key] = {};
                }
                json[v.key]["$gte"] = datevalue;
              }else{
                if (!json[v.key]) {
                  json[v.key] = {};
                }
                json[v.key]["$gte"] = v.value;
              }
            }
            if (v.type === 'lte') {
              if(cred.isDateSearch){
                let datevalue=new Date(v.value); 
                if(datevalue && !isNaN(datevalue)){
                  datevalue.setUTCHours(23, 59, 59, 999)
                }
                if (!json[v.key]) {
                  json[v.key] = {};
                }
                json[v.key]["$lte"] = datevalue;
              }else{
                if (!json[v.key]) {
                  json[v.key] = {};
                }
                json[v.key]["$lte"] = v.value;
              }
            }
            if (v.type === 'lt') {
              if (!json[v.key]) {
                json[v.key] = {};
              }
              json[v.key]["$lt"] = v.value;
            }
            if (v.type === 'gt') {
              if (!json[v.key]) {
                json[v.key] = {};
              }
              json[v.key]["$gt"] = v.value;
            }
            if (v.type === 'or') {
              if (!json['$or']) {
                json['$or'] = [];
              }
              let jsonNew = {};
              jsonNew[v.key] = { '$regex': v.value, '$options': 'i' };
              json['$or'].push(jsonNew);
            }
            if (v.type === 'ne') {
              if (v.value instanceof Date) {
                json[v.key] = { $ne: v.value };
              }
              else if (mongoose.Types.ObjectId.isValid(v.value)) {
                json[v.key] = { $ne: v.value };
              }
              else if (typeof v.value == "object") {
                json[v.key] = { $ne: v.value };
              }
              else if (typeof v.value == "boolean") {
                json[v.key] = v.value;
              }
              else if (typeof v.value == "number") {
                json[v.key] = { $ne: v.value };
              }
              else {
                if (v.value)
                  json[v.key] = { $ne : v.value };
              }
            }
            if (v.type === 'nin') {
              if (Array.isArray(v.value))
                json[v.key] = { "$nin": v.value };
              else if (v.value instanceof Date) {
                json[v.key] = { $nin: v.value };
              }
              else if (mongoose.Types.ObjectId.isValid(v.value)) {
                json[v.key] = { $nin: v.value };
              }
              else if (typeof v.value == "object") {
                json[v.key] = { $ne: v.value };
              }
              else if (typeof v.value == "boolean") {
                json[v.key] = v.value;
              }
              else if (typeof v.value == "number") {
                json[v.key] = { $ne: v.value };
              }
              else {
                if (v.value)
                  json[v.key] = { $not: { $regex: v.value, $options: 'i' } };
              }
            }
            if (v.type === 'regexOr') {
              json[v.key] = { '$regex': v.value, '$options': 'i' };
            }
            if(v.type === 'sw'){
              json[v.key] ={'$regex': '^'+v.value, '$options':'i'}
            }
            if (v.type === 'ew') {
              json[v.key] = { '$regex': v.value + '$','$options': 'i' };
            }
            if(v.type == 'exsits'){
              query[v.key] = { $exists: true }
            }
            if(v.type == 'nexsits'){
              query[v.key] = { $exists: false }
            }
            if (v.type == 'notexists') {
              json[v.key] = { "$exists": false }
            }
            if (v.type === 'datenin' && Array.isArray(v.value)) {
              let startDate = new Date(v.value[0]);
              let endDate = v.value[1] ? new Date(v.value[1]) : new Date(v.value[0]);

              if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);

                json[v.key] = { $not: { $gte: startDate, $lte: endDate } };
                console.log(`$not Filter for ${v.key}:`, { $gte: startDate, $lte: endDate });
              }
            }

            if (v.type === 'datelt' && Array.isArray(v.value)) {
              let dateValue = new Date(v.value[0]);

              if (!isNaN(dateValue.getTime())) {
                dateValue.setHours(0, 0, 0, 0);

                json[v.key] = { $lt: dateValue };
                console.log(`$lt Filter for ${v.key}:`, { $lt: dateValue });
              }
            }

            if (v.type === 'datelte' && Array.isArray(v.value)) {
              let datevalue = new Date(v.value[0]);

              if (!isNaN(datevalue)) {
                datevalue.setUTCHours(0, 0, 0, 0);

                json[v.key] = { $lte: datevalue };
              }
            }

            if (v.type === 'dategt' && Array.isArray(v.value)) {
              let enddate = v.value[1] ? new Date(v.value[1]) : new Date(v.value[0]);

              if (!isNaN(enddate)) {
                enddate.setUTCHours(23, 59, 59, 999);

                json[v.key] = { $gt: enddate };
              }
            }

            if (v.type === 'dategte' && Array.isArray(v.value)) {
              let enddate = v.value[1] ? new Date(v.value[1]) : new Date(v.value[0]);

              if (!isNaN(enddate)) {
                enddate.setUTCHours(23, 59, 59, 999);

                json[v.key] = { $gte: enddate };
              }
            }

            if (v.type == 'dateIsNot') {
              let datevalue = new Date(v.value); let enddate = new Date(v.value)
              if (datevalue && !isNaN(datevalue) && enddate && !isNaN(enddate)) {
                datevalue.setUTCHours(0, 0, 0, 0); enddate.setUTCHours(23, 59, 59, 999)
                json[v.key] = { $not: { $gt: datevalue, $lt: enddate } }
              }
            }
            if (v.type == 'dateeq') {
              let datevalue = new Date(v.value);
              let enddate = new Date(v.value);
              if (datevalue && !isNaN(datevalue) && enddate && !isNaN(enddate)) {
                let datevalue = new Date(v.value); let enddate = new Date(v.value)
                datevalue.setUTCHours(0, 0, 0, 0); enddate.setUTCHours(23, 59, 59, 999)
                json[v.key] = { $gte: datevalue, $lte: enddate }
              }
            }

          if (v.type === 'dateis' && Array.isArray(v.value)) {
            let startDate = new Date(v.value[0]);
            let endDate = v.value[1] != null ? new Date(v.value[1]) : new Date(v.value[0]);

            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
              startDate.setHours(0, 0, 0, 0);
              endDate.setHours(23, 59, 59, 999);

              json[v.key] = { $gte: startDate, $lte: endDate };
            }
          }
          });
        }
      }
    }
  } else if (req.pair) {
    data = req;
    let fields = ['userId', 'pair'];
    // field wise filtering
    fields.forEach((field) => {
      json[field] = data[field];
    });
    // 1day
    if (data.type === '1day') {
      json['created'] = dateUtil.getOneDayQuery();
    }
    // 1 week
    if (data.type === '1week') {
      json['created'] = dateUtil.getThisWeekQuery();
    }
    // 1 month
    if (data.type === '1month') {
      json['created'] = dateUtil.getOneMonthDatesQuery();
    }
    // 3 month
    if (data.type === '3month') {
      json['created'] = dateUtil.getThreeMonthsQuery();
    }
    let fromdate = data.fromdate || data.fromDate;
    let todate = data.todate || data.toDate;
    // fromdate or tdate
    if (fromdate || todate) {
      if (fromdate) {
        json['created'] = { $lte: new Date(fromdate + 'T23:59:59Z'), $gte: new Date(fromdate + 'T00:00:00Z') };
      }
      if (todate) {
        json['created'] = { $lte: new Date(todate + 'T23:59:59Z'), $gte: new Date(todate + 'T00:00:00Z') };
      }
      if (fromdate && todate) {
        json['created'] = { $lte: new Date(todate + 'T23:59:59Z'), $gte: new Date(fromdate + 'T00:00:00Z') };
      }
    }
  }

  criteria.filter = json;
  criteria.sorting = {};
  if (criteria.direction === 'desc') {
    criteria.sorting[criteria.sortfield] = -1;
  } else {
    criteria.sorting[criteria.sortfield] = 1;
  }

  criteria = await checkAndAddSecondarySorting(req, criteria)

  return criteria;
}

/**@Add secondary sortfields */
const checkAndAddSecondarySorting = async(req, criteria)=>{
  let filter ; let sortingValues
  if(req && req.query && req.query.filter){
    filter= JSON.parse(req.query.filter);
    if(filter.secondorySorting && filter.secondorySorting.length > 0){
      sortingValues= convertToSorting(filter.secondorySorting)
      criteria.sorting= {...criteria.sorting,...sortingValues}
    } 
  }
  return criteria
} 

/**@Convert array of objects to single object */
const convertToSorting = (arr)=>{
  return arr.reduce((acc, curr) => {
    acc[curr.field] = curr.direction === 'asc' ? 1 : -1;
    return acc;
  }, {});
}

/**
 * encode string using buffer
 * @param enString
 * @returns encodeString
 */
const encodeString = (enString) => {
  return new Buffer(enString).toString('base64');
}

/**
 * decode string using buffer
 * @param deString
 * @returns decodeString
 */
const decodeString = (deString) => {
  return new Buffer(deString, 'base64').toString();
}

/**
 * Extend an object
 * @param {object} src 
 * @param {object} dest 
 */
const extendObject = (src = {}, dest = {}) => {
  // Set filter criteria by pair
  let destination = Object.keys(dest);
  if (destination.length > 0) {
    destination.forEach((key) => {
      if (key) {
        src[key] = dest[key];
      }
    })
  }
  return src;
};

/**
 * Js upper string
 * @param string String
 */
const jsUcfirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};


const getRedisKey = (pair, name) => {
  return `${pair}${name}`;
};

/**
 * remove body fields
 * @param req Object
 * @param res Object
 * @param next Function
 */
const removeBodyFields = (req, res, next) => {
  let removeFieldsArr = ['active'];
  removeFieldsArr.forEach((field) => {
    if (req.body && (req.body[field] || typeof req.body[field] === 'boolean')) {
      delete req.body[field];
    }
  });
  next();
};



/**
 * secure api
 * @param req Object
 * @param res Object
 * @param next Function
 */
const secureApi = async (req, res, next) => {
  let settings = await settingsModel.findOne({ active: true });
  if (settings && settings.secureApi) {
    if (req && req.headers && req.headers['postman-token']) {
      return res.json({ errorCode: "9001", errorMessage: "Not Authorized" });
    } else {
      next();
    }
  } else {
    next();
  }

};

const camelize = (str) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
};

const getIpDetails = async (ipAddress) => {
  return new Promise((resolve, reject) => {
    iplocation(ipAddress, [], (error, res) => {
      resolve(res)
    });
  })
};

const generateRandomNumber = (min, max) => {
  let options = {
    min: min,
    max: max,
    integer: true
  }
  return randomNumber(options);
};

const generateSequenceNumber = (number, length) => {
  let out = ''
  for (let i = number.length; i < length; i++) {
    out += '0';
  }
  return out + number;
}

const createCryptoRandomString = (length) => {
  let random = randomString(length)
  return random
};

let description=''
const compareObjects = async (object1, object2) => {
  description = ''
  for (let pair in object2) {
    console.log("pair", pair, "object1[pair]", object1[pair], "object2[pair]", object2[pair], "typeof (object1[pair])", typeof (object1[pair]))
    /**@If field is object */
    if(typeof object2[pair] === 'object' && object2[pair] !== null && !Array.isArray(object2[pair]) 
    && typeof object1[pair] === 'object' && object1[pair] !== null && !Array.isArray(object1[pair])){
      object2[pair].autofield=pair
      await getdescription(object1[pair],object2[pair])
    }
    // if (pair === 'openingTime' || pair === 'closingTime') {
    //   object1[pair] = new Date(object1[pair])
    //   object2[pair] = new Date(object2[pair])
    //   let date1 = await dateFormat(object1[pair])
    //   let date2 = await dateFormat(object2[pair])
    //   // date1 === date2 ? '' : description += `"${pair}" is previously "${date1}" and changed to "${date2}",`
    //   date1 === date2 ? '' : description += `"${pair}" is updated from "${date1}" to "${date2}",`
    //   console.log("pair", pair, "date1", date1, "date2", date2, "typeof (date1)", typeof (date1), "typeof (date2)", typeof (date2))
    // }
    if ((object1[pair] || object1[pair] === false) &&
      ((typeof (object1[pair]) === "string" && typeof (object2[pair]) === "string") ||
        (typeof (object1[pair]) === "number" && typeof (object2[pair]) === "number") ||
        (typeof (object1[pair]) === "boolean" && typeof (object2[pair]) === "boolean")) &&
      pair !== '__v' && object1[pair] !== '') {
      // object1[pair] === object2[pair] ? '' : description += `"${pair}" is previously "${object1[pair]}" and changed to "${object2[pair]}",`
      object1[pair] === object2[pair] ? '' : description += `"${pair}" is updated from "${object1[pair]}" to "${object2[pair]}",`
    }
    if (!object1[pair] && pair !== '__v' && object2[pair] !== '') {
      if (object1[pair] !== false && object1[pair] !== 0)
      if(pair != "levels"){
        if(object2[pair]) description += `${pair} is added ${object2[pair]},`
      } 
    }
    /**@If field is array of objects*/
    if (Array.isArray(object2[pair]) && object2[pair].every((item) => typeof item === 'object' && item !== null && !Array.isArray(item)) &&
    Array.isArray(object1[pair]) && object1[pair].every((item) => typeof item === 'object' && item !== null && !Array.isArray(item))){
      let arrayFields2=object2[pair]
      let arrayFields1=object1[pair]
      for(let obj2 of arrayFields2){
        for(let obj1 of arrayFields1){
          const keys1 = Object.keys(obj1).sort();
          const keys2 = Object.keys(obj2).sort();
          if (_.isEqual(keys1, keys2)) {
            await getdescription(obj1, obj2);
          } 
        }
      }
    }

  }
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>", description)
  return description
}

const getdescription= async(object1, object2)=>{
  for(let pair in object2){
    if(typeof object2[pair] === 'object' && object2[pair] !== null && !Array.isArray(object2[pair]) 
    && typeof object1[pair] === 'object' && object1[pair] !== null && !Array.isArray(object1[pair])){
      object2[pair].autofield=pair
      await getdescription(object1[pair],object2[pair])
    }
    else if ((object1[pair] || object1[pair] === false) &&
    ((typeof (object1[pair]) === "string" && typeof (object2[pair]) === "string") ||
      (typeof (object1[pair]) === "number" && typeof (object2[pair]) === "number") ||
      (typeof (object1[pair]) === "boolean" && typeof (object2[pair]) === "boolean")) &&
    pair !== '__v' && object1[pair] !== '') {
    object1[pair] === object2[pair] ? '' : description += `${object2['autofield']} is updated from "${object1[pair]}" to "${object2[pair]}",`
  }
  }
}

const getPermissions = async (role) => {
  return await rolesModel.findUniqueRole(role);
}

/**
 * Delete a file
 * @param {string} filePath - Path of the file to delete
 */
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export default {
  generateUUID5,
  getBearerToken,
  generateUUID,
  generateRandomString,
  generateListQuery,
  getClientIp,
  encodeString,
  decodeString,
  extendObject,
  jsUcfirst,
  getRedisKey,
  removeBodyFields,
  camelize,
  getIpDetails,
  secureApi,
  generateRandomNumber,
  generateSequenceNumber,
  checkPermission,
  createCryptoRandomString,
  compareObjects,
  getPermissions,
  deleteFile
};