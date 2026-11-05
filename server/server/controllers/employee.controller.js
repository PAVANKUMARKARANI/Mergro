/**Models*/
import employeeModel from '../models/employee.model';
import roleModel from '../models/roles.model';
import listPreferencesModel from '../models/listPreferences.model.js';
/**Services*/
import employeeService from '../services/employee.service';
import EmailService from '../services/email.service'
import activityService from '../services/activity.service';
import exportToCsvViewService from '../services/exportToCsvViews.service.js';
/**Utils*/
import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
import i18nUtil from '../utils/i18n.util';
import sessionUtil from '../utils/session.util';
const emailService = new EmailService()
import config from '../config/config'
import _ from 'lodash';


const controller = "Employee";

/**
 * Create new employee
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
 async function register(req, res) {
    logger.info('Log:Employee Controller:register: body :' + JSON.stringify(req.body), controller);
  
    await serviceUtil.checkPermission(req, res, "Edit", controller);
    if(req.body && req.body.email) req.body.email=req.body.email.toLowerCase()
    let employee = new employeeModel(req.body);
  
    //check email exists or not
    const uniqueEmail = await employeeModel.findUniqueEmail(employee.email);
    if (uniqueEmail) {
      req.i18nKey = 'emailExists';
      logger.error('Error:employee Controller:register:' + i18nUtil.getI18nMessage('emailExists'), controller);
      return res.json(respUtil.getErrorResponse(req));
    }
    let requiredFieldError = await employeeService.requriedFields(req)
    if(requiredFieldError){
      req.i18nKey = 'requriedField';
      return res.json(respUtil.getErrorResponse(req));
    }
    
    /*replace_*validateFieldData*/
    employee = await employeeService.setCreateEmployeeVariables(req, employee)

    /**@create ListPreference for individual login type */
    let newListPreference = await new listPreferencesModel({columnOrder:config.columnOrder,employeeId:employee._id});
    /**@Saving the ListPreference */
    let savedPreference = await listPreferencesModel.saveData(newListPreference);
    /**@Assign that Preference to User */
    employee.listPreferences = savedPreference._id;

    req.employee = await employeeModel.saveData(employee);
    req.employee.password = req.employee.salt = undefined;
    req.entityType = 'employee';
    req.activityKey = 'employeeRegister';
    activityService.insertActivity(req);
    if (req.body.email) {
    emailService.sendEmailviaGrid({
        templateName: config.emailTemplates.employeeCreate,
        entityType: sessionUtil.getLoginType(req),
        emailParams: {
            to: req.body.email
            // link: templateInfo.clientUrl + '#/changeRecoverPassword/' + req.token + '?active=true'
        }
    });
}
    //send email to employee
    // emailService.sendEmail(req, res);
    // let templateInfo = JSON.parse(JSON.stringify(config.mailSettings));
    // emailService.sendEmailviaGrid({
    //   templateName: config.emailTemplates.employeeWelcome,
    //   emailParams: {
    //     to: employee.email,
    //     displayName: employee.displayName,
    //     Id: req.employee._id,
    //     link: templateInfo.adminUrl
    //   }
    // });
    logger.info('Log:employee Controller:register:' + i18nUtil.getI18nMessage('employeeCreate'), controller);
    return res.json(respUtil.createSuccessResponse(req));
  }
  
/**
 *  auth-multiDelete employee.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function multidelete(req, res, next) {
  logger.info('Log:Employee Controller:multidelete: query,body :' + JSON.stringify(req.query, req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  if (req.body && req.body.selectedIds && req.body.selectedIds.length > 0) {
    const validation = await checkOwnRecordIdExists(req);
    if (validation.isError) {
      return res.json(respUtil.getErrorResponse(req));
    }
    await employeeModel.updateMany(
      { _id: { $in: req.body.selectedIds } },
      {
        $set: {
          active: false,
          updated: new Date()
        }
      },
      { multi: true }
    );
  }
  req.entityType = 'employee';
  req.activityKey = 'employeeDelete';
  // adding employee delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

/**
 * checkOwnRecordExists
 * @param {*} req 
 * @returns+
 */
async function checkOwnRecordIdExists(req) {
  for (let selectedId of req.body.selectedIds) {
    if (req.tokenInfo && req.tokenInfo._id.toString() == selectedId.toString()) {
      req.i18nKey = "reqUnAuthorized";
      return { isError: true }
    }
  }
  return { isError: false }
}

/**
 * Get employee
 * @param req
 * @param res
 * @returns {details: Employee}
 */
async function get(req, res) {
  logger.info('Log:Employee Controller:get: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  res.json({
    details: req.employee
  });
}// import { Employee } from "mocha";


/**
 * Get employee list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {employees: employees, pagination: pagination}
 */
async function list(req, res, next) {
  let employees
  logger.info('Log:Employee Controller:list: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  const query = await serviceUtil.generateListQuery(req,"employee");  
  // if (req.tokenInfo && req.tokenInfo._doc._id && req.tokenInfo._doc.role && req.tokenInfo._doc.role != 'Admin') {
  //   query.filter.createdBy = req.tokenInfo._id
  // }
  let roleDetails = {}
  if (req.tokenInfo && req.tokenInfo._doc && req.tokenInfo._doc.role) {
    roleDetails = await roleModel.findOne({ role: req.tokenInfo._doc.role, active:true })
  }
  if (!req.query.searchFrom) {
    if (req.tokenInfo && req.tokenInfo._doc && req.tokenInfo._doc._id && roleDetails && roleDetails.roleType && roleDetails.roleType === "Employee") {
      // query.filter.createdBy = req.tokenInfo._doc._id
      query.filter["$or"] = [{ createdBy: { $in: [req.tokenInfo._doc._id] } }, ];
    } else if (req.tokenInfo && req.tokenInfo._doc && req.tokenInfo._doc._id && roleDetails && roleDetails.roleType && roleDetails.roleType === "Manager") {
      let level = 0
      roleDetails.levels ? level = roleDetails.levels : level = 1;
      if (level >= 2) {
        level = level - 1;
        let reportingMembersArray = [req.tokenInfo._doc._id]
        level = level - 1;
        let reportingMembers = await employeeModel.find({ reportingTo: req.tokenInfo._doc._id }, { _id: 1 });
        for (let obj of reportingMembers) {
          reportingMembersArray.push(obj._id);
        }
        if (level > 0) {
          var flag = true
          while (flag) {
            if (reportingMembers && reportingMembers.length > 0) {
              let value1 = await employeeService.getEmployees(reportingMembers)
              reportingMembersArray = [...reportingMembersArray, ...value1];
              reportingMembers = JSON.parse(JSON.stringify(value1));
            } else {
              flag = false;
            }
            level = level - 1;
            level == 0 ? flag = false : null
          }
        }
        if (reportingMembersArray.length > 0) {
          // query.filter.reportingTo = { $in: reportingMembersArray };
          query.filter["$or"] = [{ reportingTo: { $in: reportingMembersArray } }, ];
        }
      } else {
        // query.filter.reportingTo = req.tokenInfo._doc._id //ofor Employee crud
        query.filter["$or"] = [{ reportingTo: { $in: [req.tokenInfo._doc._id] } }, ];
      }
    }
  }
  req.entityType = 'employee';
  query.dbfields = { password: 0, salt: 0, _v: 0 };
  if (req.query.type === 'exportToCsv') {
    query.limit = (query.pagination.totalCount>200) ? 200 : query.pagination.totalCount
  }

  employees = await employeeModel.list(query);
  if (req.query.type === 'exportToCsv') {
    employees = await exportToCsvViewService.applyCsvHashingToActions(req, employees);
  }
  query.pagination.totalCount = await employeeModel.totalCount(query);

  res.json({
    employees: employees,
    pagination: query.pagination
  });
}


/**
 * Load employee and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  try{
    req.employee = await employeeModel.get(req.params.employeeId);
    return next();
  }catch(err){
    req.i18nKey="idNotFound"
    return res.json(respUtil.getErrorResponse(req))
  }
}

/**
 * Create new employee
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Employee Controller:create: body :' + JSON.stringify(req.body), controller);

  await serviceUtil.checkPermission(req, res, "Edit", controller);
  if(req.body && req.body.email) req.body.email=req.body.email.toLowerCase()
  let employee = new employeeModel(req.body);
  let preCreateResult = await preCreate(employee)
  //check email exists or not
  const uniqueEmail = await employeeModel.findUniqueEmail(employee.email);
  if (uniqueEmail) {
    req.i18nKey = 'emailExists';
    logger.error('Error:employee Controller:create:' + i18nUtil.getI18nMessage('emailExists'), controller);
    return res.json(respUtil.getErrorResponse(req));
  }
  let requiredFieldError = await employeeService.requriedFields(req)
  if(requiredFieldError){
    req.i18nKey = 'requriedField';
    return res.json(respUtil.getErrorResponse(req));
  }
  
  
  employee = await employeeService.setCreateEmployeeVariables(req, employee)
  let validateRes = await employeeService.validateFields(req, req.body);
              if(validateRes){
              return res.json(respUtil.getErrorResponse(req));
            }

  /**@create ListPreference for individual login type */
  let newListPreference = await new listPreferencesModel({columnOrder:config.columnOrder,employeeId:employee._id});
  /**@Saving the ListPreference */
  let savedPreference = await listPreferencesModel.saveData(newListPreference);
  /**@Assign that Preference to User */
  employee.listPreferences = savedPreference._id;

  let preSaveCreateResult = await preSaveCreate(employee)
  req.employee = await employeeModel.saveData(employee);
  let postSaveCreateResult = await postSaveCreate(req.employee)
  req.employee.password = req.employee.salt = undefined;
  req.entityType = 'employee';
  req.activityKey = 'employeeCreate';
  activityService.insertActivity(req);
  if (req.body.email) {
    emailService.sendEmailviaGrid({
        templateName: config.emailTemplates.employeeCreate,
        entityType: sessionUtil.getLoginType(req),
        emailParams: {
            to: req.body.email
            // link: templateInfo.clientUrl + '#/changeRecoverPassword/' + req.token + '?active=true'
        }
    });
}
  //send email to employee
  // emailService.sendEmail(req, res);
  // let templateInfo = JSON.parse(JSON.stringify(config.mailSettings));
  // emailService.sendEmailviaGrid({
  //   templateName: config.emailTemplates.employeeWelcome,
  //   emailParams: {
  //     to: employee.email,
  //     displayName: employee.displayName,
  //     Id: req.employee._id,
  //     link: templateInfo.adminUrl
  //   }
  // });
  logger.info('Log:employee Controller:create:' + i18nUtil.getI18nMessage('employeeCreate'), controller);
  return res.json(respUtil.createSuccessResponse(req));
}


/**
 * Update existing employee
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Employee Controller:update: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let employee = req.employee;
  let preUpdateResult = await preUpdate(employee)
  
  req.description = await serviceUtil.compareObjects(employee, req.body);
  employee = Object.assign(employee, req.body);
  // employee = _.merge(employee, req.body);
  // employee.set(req.body);
  employee = await employeeService.setUpdateEmployeeVariables(req, employee);
  let validateRes = await employeeService.validateFields(req, req.body);
              if(validateRes){
              return res.json(respUtil.getErrorResponse(req));
            }
  let preSaveUpdateResult = await preSaveUpdate(employee)
  req.employee = await employeeModel.saveData(employee);
  let postSaveUpdateResult = await postSaveUpdate(req.employee)
  req.entityType = 'employee';
  req.activityKey = 'employeeUpdate';

  // adding employee update activity
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Delete employee.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Employee Controller:remove: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let employee = req.employee;
  let preRemoveResult = await preRemove(employee)
  employee.active = false;
  employee = await employeeService.setUpdateEmployeeVariables(req, employee);
  let preSaveRemoveResult = await preSaveRemove(employee)
  req.employee = await employeeModel.saveData(employee);
  let postSaveRemoveResult = await postSaveRemove(req.employee)
  req.entityType = 'employee';
  req.activityKey = 'employeeDelete';

  // adding employee delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

/**
 * multiupdate
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function multiupdate(req,res,next){
    logger.info('Log:Employee Controller:multiupdate: query,body :' + JSON.stringify(req.body));
    await serviceUtil.checkPermission(req, res, "Edit", controller);
    if(req.body && req.body.selectedIds && req.body.selectedIds.length > 0  && req.body.updatedDetails){
      await employeeModel.updateMany({ 
        _id:{ $in : req.body.selectedIds }
        },
        { $set: req.body.updatedDetails }
      )
    }
    req.entityType = 'employee';
    req.activityKey = 'employeeUpdate';
    activityService.insertActivity(req);
    res.json(respUtil.updateSuccessResponse(req));
  }

 const preCreate=async(employee)=>{
    /**@Add Your custom Logic */
}  
  
const preSaveCreate=async(employee)=>{
    /**@Add Your custom Logic */
} 
  
const postSaveCreate=async(employee)=>{
    /**@Add Your custom Logic */
}
const preUpdate=async(employee)=>{
    /**@Add Your custom Logic */
}  
  
const preSaveUpdate=async(employee)=>{
    /**@Add Your custom Logic */
} 
  
const postSaveUpdate=async(employee)=>{
    /**@Add Your custom Logic */
}
const preRemove=async(employee)=>{
    /**@Add Your custom Logic */
}  
  
const preSaveRemove=async(employee)=>{
    /**@Add Your custom Logic */
} 
  
const postSaveRemove=async(employee)=>{
    /**@Add Your custom Logic */
}


export default {register,multidelete,get,list,load,create,update,remove,multiupdate}