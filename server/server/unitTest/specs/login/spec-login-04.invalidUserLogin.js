import 'babel-polyfill';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import { setTimeout } from 'timers';

import app from '../../../index';

// load predfined modules
import responseCodes from '../../data/response-codes.json';

// initialize models
import User from '../../models/user';

import i18nUtil from '../../../utils/i18n.util';

// load payload module
import payload from '../../http-requests/lib/payloads';
const user = new User();
chai.config.includeStack = true;

describe('## Check user invalid login', () => {
  it('User login :: should get invalid doctor login', (done) => {
    const loginPostBody = payload.getPostLogin(user);
    request(app)
      .post('/api/auth/login')
      .send(loginPostBody)
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        // check access token
        req.i18nKey = 'loginError';
        expect(res.body).to.have.property('errorMessage');
        expect(res.body.errorCode).to.equal(responseCodes.error);
        expect(res.body.errorMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey))
        done();
      })
      .catch(done);
  });
});