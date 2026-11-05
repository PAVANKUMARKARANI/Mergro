import Employee from "../models/employee.model";

/**Services*/
import uploadeService from "../services/upload.service";
import imageUploadService from "../services/imageUpload.service";
import attachmentUploadService from "../services/attachmentUpload.service";
/**Utils*/
import i18nUtil from "../utils/i18n.util";
import respUtil from "../utils/resp.util";
import sessionUtil from "../utils/session.util";
import serviceUtil from "../utils/service.util";
import config from "../config/config";

const controller = "Upload";
var fs = require("fs");

/**
 * Upload pictures and documents
 */
async function upload(req, res, next) {
  logger.info(
    "Log:Upload Controller :body:" + JSON.stringify(req.body),
    controller
  );
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  if (
    sessionUtil.checkTokenInfo(req, "_id") &&
    sessionUtil.checkTokenInfo(req, "loginType")
  ) {
    req.entityType = sessionUtil.getTokenInfo(req, "loginType");
    if (req.entityType === "employee") {
      req.details = await Employee.get(sessionUtil.getTokenInfo(req, "_id"));
    } else {
      req.i18nKey = "invalidLoginType";
      return res.json(respUtil.getErrorResponse(req));
    }
  } else {
    req.i18nKey = "invalidLoginType";
    return res.json(respUtil.getErrorResponse(req));
  }
  req.uploadFile = [];
  req.uploadPath = req.query.uploadPath;
  // req.details.updatedBy[req.entityType] = sessionUtil.getTokenInfo(req, "_id");
  req.details.updated = Date.now();
  //Calling the activity of uploading the required file
  imageUploadService.upload(req, res, async (err) => {
    if (err) {
      logger.error(
        `Error:Upload Controller: Change ${req.entityType} Logo: Error:' + JSON.stringify(err)`,
        controller
      );
      req.i18nKey = "Upload Directory not Found";
      return res.json(respUtil.getErrorResponse(req));
    } else if (req.uploadFile && req.uploadFile[0] && req.uploadFile[0].name) {
      req.image = req.uploadFile;
      req.details.photo = req.uploadFile;
      console.log(req.details);
      //Saving the changes of the entityType
      console.log(req.entityType);
      if (req.entityType === "employee") {
        req.details = await Employee.get(sessionUtil.getTokenInfo(req, "_id"));
      }

      req.entityType = `${req.entityType}`;
      console.log(req.entityType);
      req.entityType = req.uploadPath
        ? `${req.uploadPath}Upload`
        : `${req.entityType}Upload`;
      req.activityKey = `${req.entityType}Upload`;
      logger.info(
        `Log:Upload Controller:Change ${
          req.entityType
        } logo:${i18nUtil.getI18nMessage(req.activityKey)}`,
        controller
      );
      return res.json(respUtil.uploadLogoSucessResponse(req));
    } else {
      req.i18nKey = `${req.entityType}LogoUploadedErrorMessage`;
      logger.error(
        `Error:Upload:Change ${req.entityType} Logo: Error : ${req.entityType} Logo not uploded.`,
        controller
      );
      return res.json(respUtil.getErrorResponse(req));
    }
  });
}

async function csvUpload(req, res) {
  logger.info(
    "Log:User Controller:uploadCsvFile: Query : " + JSON.stringify(req.query)
  );
  req.uploadFile = [];
  req.uploadPath = "bulkupload";
  req.user = req.tokenInfo;
  //gets the uploded file
  uploadeService.upload(req, res, async (err) => {
    if (err) {
      console.log("err", err);
      logger.error(
        "Error:Csv Controller:uploadCsvFile: Error : " + JSON.stringify(err)
      );
    } else if (req.uploadFile && req.uploadFile[0] && req.uploadFile[0].name) {
      //converts the csv format to json object format
      req.obj = await uploadeService.getJsonFromCsv(req);
    } else {
      req.i18nKey = "CsvNotUploaded";
      logger.error(
        "Error:Csv Controller:uploadCsvFile: Error : csv file not uploaded."
      );
      return res.json(await respUtil.getErrorResponse(req));
    }

    if (req.obj && req.obj.length > 0) {
      //calling multiple insert activity
      let uploadDetails = await uploadeService.insertBulkData(req, res);
      if (uploadDetails) {
        return res.json(uploadDetails);
      }
    } else {
      req.i18nKey = "emptyFile";
      return res.json(await respUtil.getErrorResponse(req));
    }
  });
}

async function uploadAttachements(req, res) {
  logger.info(
    "Log:Upload Controller :body:" + JSON.stringify(req.body),
    controller
  );
  req.uploadFile = [];
  req.uploadPath = `${req.query.type}`.toLowerCase();
  req.entityType = req.uploadPath;
  attachmentUploadService.upload(req, res, (err) => {
    if (err) {
      logger.error(
        `Error:Upload Controller: ${req.entityType} Attachments: Error:` +
          JSON.stringify(err),
        controller
      );
      req.i18nKey = "Upload Directory not Found";
      return res.json(respUtil.getErrorResponse(req));
    } else if (req.uploadFile && req.uploadFile[0] && req.uploadFile[0].name) {
      console.log(
        "UploadFile---------------------------------->",
        req.uploadFile
      );
      req.uploadFile.forEach(async function (value) {
        let stats = fs.statSync(
          config.upload[req.uploadPath + "attachment"] + "/" + value.name
        );
        let fileSizeInBytes = stats["size"];
        var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
        if (fileSizeInMegabytes >= 200) {
          req.i18nKey = "fileSizeExceed";
          return res.json(respUtil.getErrorResponse(req));
        }
      });
      req.image = req.uploadFile;
      logger.info(
        `Log:Upload Controller: ${req.entityType} Attachements: Attachements uploaded successfully`,
        controller
      );
      return res.json(respUtil.uploadLogoSucessResponse(req));
    } else {
      req.i18nKey = "AttachmentUploadedError";
      return res.json(respUtil.getErrorResponse(req));
    }
  });
}

/**@RemoveAttachmentFromServer -(Remove the image and files from upload folder) */
const removeAttachments = async (req, res) => {
  if (req && req.query && !req.query.type) {
    req.i18nKey = "uploadPathReq";
    return res.json(respUtil.getErrorResponse(req));
  }
  if (req && req.body && !req.body.fileNames) {
    req.i18nKey = "fileNamesReq";
    return res.json(respUtil.getErrorResponse(req));
  }
  req.uploadPath = `${req.query.type}`.toLowerCase();
  req.removeAttachments = req.body.fileNames;
  let removeResult = await attachmentUploadService.attachmentsRemove(req, res);
  if (removeResult && removeResult.attachmentNotExist) {
    req.i18nKey = "attachmentNotExist";
    return res.json(respUtil.getErrorResponse(req));
  } else {
    req.i18nKey = "attachmentRemoved";
    return res.json(respUtil.successResponse(req));
  }
};

export default {
  upload,
  csvUpload,
  uploadAttachements,
  removeAttachments,
};
