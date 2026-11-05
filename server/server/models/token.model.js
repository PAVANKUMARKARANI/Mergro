import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';

import APIError from '../helpers/APIError';

import tokenSchemaJson from '../schemas/token.json';

const Schema = mongoose.Schema;

let defaultSchemaValues = {
  accessToken: String,
  refreshToken: String,
  loginType: String,
  loginFrom: String,
  deviceId: String,
  iosMobileAppVersion: String,
  androidMobileAppVersion: String,
  iosVersion: String,
  iosModel: String,
  devVersion: String,
  androidModel: String,
  expires: Number,
  accessTokenExpireAt: Date,
  refreshTokenExpireAt: Date,
  idscanToken: String,
  authFrom: String,
  email: String,
  updated: Date,
  created: { type: Date, default: Date.now },
  browserName: String,
  osName: String,
  osVersion: String,
  deviceType: String,
  ipAddress: String,
  createdByName: String,
  updatedByName: String,
  tokenId:String,
  isGoogleToken:{type:Boolean},
  isJWTToken:Boolean
}

/**
 * Post Schema
 */
const TokenSchema = new mongoose.Schema({
  ...defaultSchemaValues,
  ...tokenSchemaJson
}, { usePushEach: true });

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
TokenSchema.method({
});

/**
 * Statics
 */
TokenSchema.statics = {

  /**
   * save and update token
   * @param token
   * @returns {Promise<Token, APIError>}
   */
  saveData(token) {
    return token.save()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('Error in user', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Find unique token.
   * @param {objectId} userId.
   * @returns {Promise<Token>}
   */
  findUniqueToken(email, loginType) {
    return this.findOne({
      email: email,
      loginType: loginType
    })
      .exec()
      .then((token) => token);
  }
};

/**
 * @typedef Token
 */
export default mongoose.model('Token', TokenSchema);