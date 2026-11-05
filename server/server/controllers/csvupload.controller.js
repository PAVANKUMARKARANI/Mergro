/**Utils*/
import logger from '../utils/log.util';
import respUtil from '../utils/resp.util';
/**Services*/
import uploadService from '../services/upload.service';
/**Models*/
import bulkUploadStatusModel from '../models/bulkuploadStatus.model.js'
import config from '../config/config';

/**
 * Uploading multiple records by csv file
 */
async function BulkUpload(req, res) {
  logger.info('Log:Csv Controller:uploadCsvFile: Query : ' + JSON.stringify(req.query));
  req.uploadFile = [];
  req.uploadPath = 'bulkUpload';

  //gets the uploded file
  uploadService.upload(req, res, async (err) => {
    if (err) {
      logger.error('Error:Csv Controller:uploadCsvFile: Error : ' + JSON.stringify(err));
    } else if (req.uploadFile && req.uploadFile[0] && req.uploadFile[0].name) {
      //converts the csv format to json object format
      req.bulkUploadStatus = new bulkUploadStatusModel()
      req.bulkUploadStatus.csvFile = req.uploadFile[0].name;
      req.bulkUploadStatus.createdBy = req.tokenInfo._id;
      req.bulkUploadStatus.createdByName = req.tokenInfo.name;
      req.bulkUploadStatus.entityType = req.tokenInfo.loginType;
      req.bulkUploadStatus.csvFilePath = config.upload[req.uploadPath] + '/' + req.uploadFile[0].name;
      req.bulkUploadStatus.status = "Pending";
      req.obj = await uploadService.getJsonFromCsv(req);
      req.headerKeys = await uploadService.getKeysFromCsv(req)
    } else {
      req.i18nKey = 'CsvNotUploaded';
      logger.error('Error:Csv Controller:uploadCsvFile: Error : csv file not uploaded.');
      return res.json(respUtil.getErrorResponse(req));
    };
    if (req.obj && req.obj.length > 0) {
      //calling multiple insert activity
      req.entityType = req.query.type;
      req.activityKey = 'csvUpload';
      let responseJson = {}
      req.bulkUploadStatus.total = req.obj.length;
      responseJson.sucess = respUtil.uploadCsvSucessResponse(req)
      let uploadDetails = await uploadService.insertBulkData(req, res);
      req.bulkUploadStatus.success = req.bulkUploadStatus.total - req.bulkUploadStatus.failed
      req.bulkUploadStatus.status = "Completed";
      if (uploadDetails.duplicateFileName) {
        req.bulkUploadStatus.duplicateFile = req.duplicateFileName;
        req.bulkUploadStatus.duplicateFilePath ="images/"+ req.query.type + "Duplicates/" + req.duplicateFileName;
        req.bulkUploadStatus.duplicateFileDownloadUrl = config.mailSettings.serverUrl+'/' + req.bulkUploadStatus.duplicateFilePath
      }
      await bulkUploadStatusModel.saveData(req.bulkUploadStatus)
      if (uploadDetails) {
        res.json(uploadDetails);
      };
    } else {
      req.i18nKey = 'emptyFile';
      res.json(respUtil.getErrorResponse(req));
    };
  });
};

export default {
  BulkUpload
}