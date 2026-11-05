import 'babel-polyfill';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../../../index';

import auth from '../../http-requests/lib/authorization';
import chaiAsPromised from 'chai-as-promised';
import mochaAsync from '../../lib/mocha-async';

import credentials from '../../data/credentials.json';
import responseCodes from '../../data/response-codes.json';

import Employee from '../../models/employee';
import i18nUtil from '../../../utils/i18n.util';

import payload from '../../http-requests/lib/payloads';
import {getErrorResponseByKey,getErroResponseByErrorMessage} from '../../common.reponse'
import {generateMatchingString,generateMinLengthString,generateMaxLengthString,generateRandomNumberString,generateRandomAlphabets} from '../../string.generator'
const employee = new Employee(credentials.validEmployee);
chai.config.includeStack = true;

describe('## Check employee login', () => {
  it('Employee login :: should get valid Bearer token', (done) => {
    const loginPostBody = payload.getPostLogin(employee);
    console.log("LOGIN POST BODY::",loginPostBody);
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

describe('##CHECK INVALID LOGIN TYPE', () => {
    it('Employee Login :: SHOULD RETURN INVALID LOGIN TYPE', (done) => {
      const loginPostBody = payload.getPostLogin(employee);
      console.log("LOGIN POST BODY::",loginPostBody);
      request(app)
        .post('/api/auth/login')
        .send({...loginPostBody,entityType: generateRandomAlphabets()})
        .expect(httpStatus.OK)
        .then((res, req = {}) => {
          console.log("RES",res.body);
          expect(res.body).to.deep.equal(
            getErrorResponseByKey("invalidLoginType")
          );
          done();
        })
        .catch(done);
    });
});

describe('## INVALID EMAIL', () => {
    it('Employee login ::SHOULD GET EMAIL DOES NOT EXIST', (done) => {
      const loginPostBody = payload.getPostLogin(employee);
      request(app)
        .post('/api/auth/login')
        .send({...loginPostBody,email: `${generateRandomAlphabets()}@yopmail.com`})
        .expect(httpStatus.OK)
        .then((res, req = {}) => {
          expect(res.body).to.deep.equal(
            getErrorResponseByKey("invalidEmail")
          );
          done();
        })
        .catch(done);
    });
});

describe('## INVALID PASSWORD', () => {
    it('Employee login ::SHOULD GET INVALID PASSWORD', (done) => {
      const loginPostBody = payload.getPostLogin(employee);
      request(app)
        .post('/api/auth/login')
        .send({...loginPostBody,password: `${generateRandomAlphabets()}`})
        .expect(httpStatus.OK)
        .then((res, req = {}) => {
          expect(res.body).to.deep.equal(
            getErrorResponseByKey("invalidPassword")
          );
          done();
        })
        .catch(done);
    });
});

describe("## ROLE PERMISSIONS NOT FOUND", () => {
  beforeEach(
    mochaAsync(async () => {
      await auth.getAccessToken(employee);
    })
  );

  it("## CREATE Employee WITH NO ROLE", (done) => {
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

  it('Employee login ::SHOULD GET ROLE PERMISSIONS NOT FOUND', (done) => {
    request(app)
      .post('/api/auth/login')
      .send({email: "test1@yopmail.com" , password:"Test1234$",entityType:"employee"})
      .expect(httpStatus.OK)
      .then((res, req = {}) => {
        req.i18nKey = 'loginSuccessMessage';
        expect(res.body).to.deep.equal(
          getErrorResponseByKey("rolePermissionsNotFound")
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

