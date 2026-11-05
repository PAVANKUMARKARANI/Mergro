import 'babel-polyfill';
import request from 'supertest-as-promised';
import mochaAsync from '../../lib/mocha-async';
import httpStatus from 'http-status';
import chaiAsPromised from 'chai-as-promised';
import chai, { expect } from 'chai';
import app from '../../../index';
import auth from '../../http-requests/lib/authorization';

import credentials from '../../data/credentials.json';
import responseCodes from '../../data/response-codes.json';

import Employee from '../../models/employee';
import i18nUtil from '../../../utils/i18n.util';

import payload from '../../http-requests/lib/payloads';
import { getErrorResponseByKey, getErroResponseByErrorMessage, successResponseByEntity } from '../../common.reponse'
import { generateMatchingString, generateMinLengthString, generateMaxLengthString, generateRandomNumberString, generateRandomAlphabets } from '../../string.generator'
const employee = new Employee(credentials.validEmployee);

describe('## Employee LOGOUT', () => {

    beforeEach(
        mochaAsync(async () => {
            await auth.getAccessToken(employee);
        })
    );

    it('Employee Logout :: LOGOUT', (done) => {
        request(app)
            .post(`/api/auth/logout`)
            .set({ Authorization: `Bearer ${employee.getAccessToken()}` })
            .expect(httpStatus.OK)
            .then((res, req = {}) => {
                expect(res.body).to.deep.equal(
                    successResponseByEntity("logoutMessage")
                );
                done();
            })
            .catch(done);
    });
});