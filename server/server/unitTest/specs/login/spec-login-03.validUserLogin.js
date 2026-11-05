import 'babel-polyfill';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import { setTimeout } from 'timers';

import app from '../../../index';

// load predfined modules
import credentials from '../../data/credentials.json';
import responseCodes from '../../data/response-codes.json';

// initialize models
import User from '../../models/user';

import i18nUtil from '../../../utils/i18n.util';

// load payload module
import payload from '../../http-requests/lib/payloads';
const user = new User(credentials.validUser);
chai.config.includeStack = true;

describe('## Check user login', () => {
  it('Doctor login :: should get valid Bearer token', (done) => {
    const loginPostBody = payload.getPostLogin(user);
    request(app)
      .post('/api/auth/login')
      .send(loginPostBody)
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        // check access token
        req.i18nKey = 'loginSuccessMessage';
        expect(res.body).to.have.property('respCode');
        expect(res.body.respCode).to.equal(responseCodes.sucess);
        expect(res.body).to.have.property('respMessage');
        expect(res.body.respMessage).to.equal(i18nUtil.getI18nMessage(req.i18nKey));
        expect(res.body).to.have.property('accessToken');
        expect(res.body).to.have.property('refreshToken');
        done();
      })
      .catch(done);
  });
});