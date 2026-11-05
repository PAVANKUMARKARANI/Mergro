import multer from 'multer';
import fs from 'fs';

import config from '../config/config';
import pluralize from 'pluralize'


/**
 * Storing Uploades file
 * @return {uploded file name}
 */
let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    if (!fs.existsSync(config.upload[pluralize.plural(req.uploadPath.split(' ').join(''))])) {
      fs.mkdirSync(config.upload[pluralize.plural(req.uploadPath.split(' ').join(''))])
    }
    callback(null, config.upload[pluralize.plural(req.uploadPath.split(' ').join(''))]);
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


export default {
  upload
}