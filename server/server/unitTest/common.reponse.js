import i18nService from '../utils/i18n.util';
import httpStatus from 'http-status';
const RandExp = require('randexp');

export const successResponseByEntity = entityType => ({
    respCode : httpStatus.OK,
    respMessage : i18nService.getI18nMessage(entityType)
});

export const getErrorResponseByKey = i18nkey => ({
    errorCode: '9001',
    errorMessage : i18nService.getI18nMessage(i18nkey)
})

export const getErroResponseByErrorMessage = msg =>({
    errorCode : '9001',
    errorMessage: `${msg}`
})

