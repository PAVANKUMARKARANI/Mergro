import multer from 'multer';
import fs from 'fs';

import config from '../config/config';
import pluralize from 'pluralize'
import path from 'path'
import serviceUtil from '../utils/service.util';


/**
 * Storing Uploades file
 * @return {uploded file name}
 */
let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    console.log("Uploading.........................................");
    if(!fs.existsSync(config.upload['attachment'])){
        fs.mkdirSync(config.upload['attachment'])
    }
    if (!fs.existsSync(config.upload[pluralize.plural(req.uploadPath.split(' ').join(''))+'attachment'])) {
      fs.mkdirSync(config.upload[pluralize.plural(req.uploadPath.split(' ').join(''))+'attachment'])
    }
    callback(null, config.upload[pluralize.plural(req.uploadPath.split(' ').join(''))+'attachment']);
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

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns error
 */
const attachmentsRemove = async(req,res)=>{
  const mainDir = config.upload[pluralize.plural(req.uploadPath.split(' ').join(''))+'attachment']
  for(let attachment of req.removeAttachments){
    let attachmentPath = path.join(mainDir, attachment.name);
    if(fs.existsSync(attachmentPath)){
      await serviceUtil.deleteFile(attachmentPath)
    } 
    else {
      return {attachmentNotExist: true , reason: 'Attachment does not exsit'}
    }
  }
}


const upload = multer({
  storage: storage
}).array('file');


export default {
  attachmentsRemove,
  upload
}