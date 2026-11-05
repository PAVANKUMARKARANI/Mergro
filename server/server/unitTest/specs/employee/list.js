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
chai.use(chaiAsPromised);describe("## Check employee creation", () => {
  beforeEach(
    mochaAsync(async () => {
      // login employee and get access token
      await auth.getAccessToken(authEmployee);

      let totalemployees = await employeesModel.find({ active: true });
      employee.setId(totalemployees.length);
    })
  );

  it("## Should return the list of the employees", (done) => {
    request(app)
      .get("/api/employees")
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body).to.have.property("employees");
        expect(res.body.employees).to.be.an("array");
        expect(res.body.employees).to.not.have.length(0);
        done();
      })
      .catch(done);
  });

  it("## CHECK TOTAL RECORDS INCASE IF EXPORTTOCSV", (done) => {
    request(app)
      .get("/api/employees?type=exportToCsv")
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body).to.have.property("employees");
        expect(res.body.employees).to.be.an("array");
        expect(res.body.employees).to.not.have.length(0);
        if (employee.getId() > 200)
          expect(res.body.employees.length).to.equal(200);
        else expect(res.body.employees.length).to.equal(employee.getId());
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
    request(app)
      .get("/api/employees")

      .expect(httpStatus.OK)
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
