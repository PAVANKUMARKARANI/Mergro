import multer from 'multer';
import XLSX from 'xlsx';
import fs from 'fs';

import config from '../config/config';
import respUtil from '../utils/resp.util';
import employeeService from '../services/employee.service';
    import ticketsService from '../services/tickets.service';
    
/**
 * Storing Uploades file
 * @return {uploded file name}
 */
let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    if (!fs.existsSync(config.upload['bulkupload'])) {
      fs.mkdirSync(config.upload['bulkupload'])
    }
    callback(null, config.upload['bulkupload']);
  },
  filename: function (req, file, callback) {
    let ext = '';
    let name = '';
    if (file.originalname) {
      let p = file.originalname.lastIndexOf('.');
      ext = file.originalname.substring(p + 1);
      let firstName = file.originalname.substring(0, p + 1);
      name = Date.now() + '_' + firstName;
      name += ext;
    }
    req.uploadFile.push({ name: name });
    if (req.uploadFile && req.uploadFile.length > 0) {
      callback(null, name);
    }
  }
});

const upload = multer({
  storage: storage
}).array('file');

//Insert records into the database
async function insertBulkData(req, res) {
  let responseJson = {}; let validateFieldsResult;
  let obj=[]
  if (req.query && req.query.type) {
    // if (req.query.type === "brands") {
    //   obj = await insertBrandData(req, res)
    // }
    
    if (req.query.type === 'Employees') {
      validateFieldsResult = await employeeService.validateEmployeeBulkFields(req, res);
      if(validateFieldsResult.headersMatched) obj = await employeeService.insertEmployeeData(req, res);
      
    }
    else if (req.query.type === 'Tickets') {
        validateFieldsResult = await ticketsService.validateTicketsBulkFields(req, res);
        if(validateFieldsResult.headersMatched) obj = await ticketsService.insertTicketsData(req, res);
        }
    else {
      req.i18nKey = "failedtoUpload";
      res.json(await respUtil.getErrorResponse(req));
      return;
    };
    //if dupicate email exists in the file a new file will get created with duplicates
    if (req.duplicates && req.duplicates.length > 0) {
      await downloadDupicates(req);
      req.i18nKey = "duplicateUpload";
      responseJson.duplicateFileName = req.duplicateFileName;
      req.bulkUploadStatus.failed = req.duplicates.length;
      delete req.errorMessage;
      responseJson.failure = await respUtil.getErrorResponse(req);
    };
    obj = obj.filter(item => item != null);
    if(validateFieldsResult && validateFieldsResult.headersNotMatched){ 
      req.bulkUploadStatus.failed = req.obj.length;
      responseJson.failure.errorMessage = validateFieldsResult.reason;
    }else if(obj && Object.keys(obj).length == 0){
      req.bulkUploadStatus.failed = req.obj.length;
      responseJson.failure.errorMessage = "All records are duplicates";
    }else {
      req.entityType = req.query.type + "Csv";
      req.activityKey = `${req.query.type}CsvUpload`;
      responseJson = { ...responseJson, ...await respUtil.uploadCsvSucessResponse(req) }
    };
  };
  return responseJson;
}

/**
 * 
 * @return {Downloaded fie} req 
 */
async function downloadDupicates(req, res) {
  let ws = XLSX.utils.json_to_sheet(req.duplicates);
  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws);
  req.duplicateFileName = req.query.type + "duplicates" + Date.now() + "_" + ".xlsx"
  if (!fs.existsSync(config.upload[`${req.query.type}Duplicates`])) {
    fs.mkdirSync(config.upload[`${req.query.type}Duplicates`])
  }
  let buf = XLSX.writeFile(wb, config.upload[`${req.query.type}Duplicates`] + '/' + req.duplicateFileName);
};

async function getJsonFromCsv(req) {
  var obj = [];
  console.log("upppppppppploooooooooooooaaaaaaaaa")
  console.log(req.uploadFile[0].name)
  req.attachment = req.uploadFile[0].name;
  let workbook = XLSX.readFile(config.upload['bulkupload'] + "/" + req.uploadFile[0].name);
  if (workbook) {
    let sheetName_list = workbook.SheetNames;
    obj = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName_list[0]]);
  }
  console.log(obj)
  return obj;

};

/**
 * @Get Excel Headers
 * @param {*} req 
 * @returns
 */
async function getKeysFromCsv(req) {
  let keys = [];
  console.log(req.uploadFile[0].name);
  req.attachment = req.uploadFile[0].name;
  let workbook = XLSX.readFile(config.upload['bulkupload'] + "/" + req.uploadFile[0].name);
  if (workbook) {
    let sheetName_list = workbook.SheetNames;
    let firstRow = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName_list[0]], { header: 1 })[0];
    keys = firstRow;
  }
  return keys;
}

export default {
  upload,
  insertBulkData,
  getJsonFromCsv,
  getKeysFromCsv
}