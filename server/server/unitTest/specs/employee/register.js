import 'babel-polyfill';
import request from 'supertest-as-promised';
import chaiAsPromised from 'chai-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../../../index';

import auth from '../../http-requests/lib/authorization';
import mochaAsync from '../../lib/mocha-async';

// load credentials
import credentials from '../../data/credentials.json';
import responseCodes from '../../data/response-codes.json';

import i18nUtil from '../../../utils/i18n.util';

// load payload module
import payload from '../../http-requests/lib/payloads/';
import Employee from '../../models/employee';
import Employee from '../../models/employee';
const authEmployee = new Employee(credentials.validEmployee);
const employee = new Employee();
const createpostBody = payload.getPostBody(employee);

import employeesModel from '../../../models/employee.model';

import {getErrorResponseByKey,getErroResponseByErrorMessage} from '../../common.reponse'
import {generateMatchingString,generateMinLengthString,generateMaxLengthString,generateRandomNumberString,generateRandomAlphabets} from '../../string.generator'

// inject promise to mocha
chai.config.includeStack = true;
chai.use(chaiAsPromised);describe("## Check employee registration", () => {
  beforeEach(
    mochaAsync(async () => {
      // login employee and get access token
      await auth.getAccessToken(authEmployee);
    })
  );

  it("## Check employee registration", (done) => {
    request(app)
      .post("/api/employees/register")
      .send(createpostBody)
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = "employeeCreate";
        expect(res.body).to.have.property("employeeId");
        expect(res.body.respCode).to.equal(responseCodes.create);
        employee.setId(res.body.employeeId);
        done();
      })
      .catch(done);
  });
});
describe("## TEST WITHOUT PASSING TOKEN", () => {
  beforeEach(
    mochaAsync(async () => {
      // login employee and get access token
      await auth.getAccessToken(authEmployee);
    })
  );

  it("WITHOUT TOKEN PASSED", (done) => {
    request(app);
    REPLACEMETHOD;
    REPLACEBODY.expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = "employeeCreate";
        expect(res.body).to.deep.equal(
          getErrorResponseByKey("noPermissionErr")
        );
        done();
      })
      .catch(done);
  });
});
