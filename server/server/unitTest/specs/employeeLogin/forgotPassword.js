import 'babel-polyfill';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../../../index';
import mochaAsync from '../../lib/mocha-async';
import credentials from '../../data/credentials.json';
import responseCodes from '../../data/response-codes.json';
import auth from '../../http-requests/lib/authorization';
import Employee from '../../models/employee';
import i18nUtil from '../../../utils/i18n.util';

import payload from '../../http-requests/lib/payloads';
import {getErrorResponseByKey,getErroResponseByErrorMessage,successResponseByEntity} from '../../common.reponse'
import {generateMatchingString,generateMinLengthString,generateMaxLengthString,generateRandomNumberString,generateRandomAlphabets} from '../../string.generator'
const employee = new Employee(credentials.validEmployee);
chai.config.includeStack = true;


describe("## CREATE AN Employee", () => {
  beforeEach(
    mochaAsync(async () => {
      await auth.getAccessToken(employee);
    })
  );

  it("## Check employee creation", (done) => {
    request(app)
      .post("/api/employees")
      .send({ ...{name:"Test", email: "test1@yopmail.com", password:"Test1234$"} })
      .set({ Authorization: `Bearer ${employee.getAccessToken()}` })
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

  it('Employee Forgot Password :: SHOULD GET MAIL SENT SUCCESSFULLY', (done) => {
    const loginPostBody = payload.getPostLogin(employee);
    console.log("LOGIN POST BODY::",loginPostBody);
    request(app)
      .post(`/api/auth/forgotPassword?email=test1@yopmail.com`)
      .send({entityType: "employee"})
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        console.log("RES",res.body);
        expect(res.body).to.deep.equal(
          successResponseByEntity("mailSent")
        );
        done();
      })
      .catch(done);
  });

  it('Employee Forgot Password :: SHOULD GET EMAIL ALREADY SENT', (done) => {
    request(app)
      .post(`/api/auth/forgotPassword?email=test1@yopmail.com`)
      .send({entityType: "employee"})
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        console.log("RES",res.body);
        expect(res.body).to.deep.equal(
          getErrorResponseByKey("emailAlreadySent")
        );
        done();
      })
      .catch(done);
  });

  it('Employee login ::SHOULD GET EMAIL NOT EXIST', (done) => {
    const loginPostBody = payload.getPostLogin(employee);
    request(app)
      .post(`/api/auth/forgotPassword?email=${generateRandomAlphabets()}@yopmail.com`)
      .send({...loginPostBody, email:undefined ,password:undefined})
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        console.log("RES",res.body);
        expect(res.body).to.deep.equal(
          getErrorResponseByKey("emailNotExist")
        );
        done();
      })
      .catch(done);
  });

  it('Employee login :: SHOULD GET INVALID LOGIN TYPE', (done) => {
    const loginPostBody = payload.getPostLogin(employee);
    request(app)
      .post(`/api/auth/forgotPassword?email=${loginPostBody.email}`)
      .send({...loginPostBody, email:undefined ,password:undefined ,entityType: generateRandomAlphabets()})
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        expect(res.body).to.deep.equal(
          getErrorResponseByKey("invalidLoginType")
        );
        done();
      })
      .catch(done);
  });

  it('Employee ChangePassword :: DELETE Employee', (done) => {
    request(app)
    .delete(`/api/employees/${employee.getId()}?response=true`)
    .set({ Authorization: `Bearer ${employee.getAccessToken()}` })
    .expect(httpStatus.OK)
    .then((res, req = {}) => {
      req.i18nKey = "employeeDelete";
      expect(res.body).to.have.property("employeeId");
      expect(res.body.respCode).to.equal(responseCodes.delete);
      done();
    })
    .catch(done);
  });

});

