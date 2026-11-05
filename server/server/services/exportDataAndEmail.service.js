import XLSX from 'xlsx';
import fs from 'fs';
const path = require('path');

import config from '../config/config';
import respUtil from '../utils/resp.util';
import EmailService from './email.service'
const emailService = new EmailService()


/**
 * @exportDataToExcel Generates Excel file for given data and returns the file path.
 * @param {*} data 
 * @param {*} entityType 
 * @returns 
 */
async function exportDataToExcel(data, entityType) {
  const now = new Date();
  const formattedTime = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  const fileName = `${formattedTime}_${entityType}_results.xlsx`;


  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${entityType} data`);

  const folderPath = path.join(__dirname, `../upload/attachment/${entityType}`);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  };

  const filePath = path.join(folderPath, fileName);

  XLSX.writeFile(workbook, filePath);

  const results = [];
  let apiUrl = config.mailSettings.serverUrl;
  return {
    filePath,
    fileName,
    folderUrlPath: `/images/attachment/${entityType}/${fileName}`,
    apiUrl
  };
}

/**
 * sendExportedDataToEmail
 * @param {*} toEmail 
 * @param {*} fileUrl 
 * @param {*} entityType 
 */
async function sendExportedDataToEmail(toEmail, fileUrl, entityType, template) {
  let getEntityType = entityType || "employee" 
  const emailTemplate = template || {
    name: "ExportData",
    subject: `Exported ${getEntityType} Data`,
    templateText: `
      <p>Hello,</p>
      <p>Please click the link below to download the exported users data:</p>
      <button><a href="###LINK###" target="_blank">Download File</a></button>
    `
  };

  await emailService.sendEmailviaGrid({
    emailTemplate,
    getEntityType,
    emailParams: {
      to: toEmail || "employee1@yopmail.com",
      link: fileUrl
    }
  });
}


export default {
  exportDataToExcel,
  sendExportedDataToEmail
}