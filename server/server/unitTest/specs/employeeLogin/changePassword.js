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
import {getErrorResponseByKey,getErroResponseByErrorMessage,successResponseByEntity} from '../../common.reponse'
import {generateMatchingString,generateMinLengthString,generateMaxLengthString,generateRandomNumberString,generateRandomAlphabets} from '../../string.generator'
const employee = new Employee(credentials.validEmployee);
chai.config.includeStack = true;

const changePasswordBody={
    "entityType":"employee",
    "currentPassword":"Test1234$",
    "newPassword":"TestChanged1234$",
    "confirmPassword":"TestChanged1234$"
}

const newPasswordNotProvided ={
    errors: [
      {
        msg: 'please provide newPassword in body',
        param: 'newPassword',
        location: 'body'
      }
    ]
  }
  

chai.use(chaiAsPromised);describe("## Check employee creation", () => {
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
});


describe('## INVALID LOGIN TYPE', () => {
    it('Employee ChangePassword :: SHOULD GET INVALID LOGIN TYPE', (done) => {
      request(app)
        .post(`/api/auth/changePassword?_id=${employee.getId()}`)
        .send({...changePasswordBody, entityType : generateRandomAlphabets()})
        .set({ Authorization: `Bearer ${employee.getAccessToken()}` })
        .expect(httpStatus.OK)
        .then((res, req = {}) => {
          expect(res.body).to.deep.equal(
            getErrorResponseByKey("invalidLoginType")
          );
          done();
        })
        .catch(done);
    });
});

describe('## DETAILS NOT FOUND', () => {
    it('Employee ChangePassword :: SHOULD GET DETAILS NOT FOUND', (done) => {
      request(app)
        .post(`/api/auth/changePassword?adminReset=true&&_id=${employee.getId()+123}`)
        .send({...changePasswordBody})
        .set({ Authorization: `Bearer ${employee.getAccessToken()}` })
        .expect(httpStatus.OK)
        .then((res, req = {}) => {
          expect(res.body).to.deep.equal(
            getErrorResponseByKey("detailsNotFound")
          );
          done();
        })
        .catch(done);
    });
});

describe('## UPDATING SAME PASSWORD', () => {
    it('Employee ChangePassword :: SHOULD GET CURRENT PASSWORD IS SAME AS OLD PASSWORD', (done) => {
      request(app)
        .post(`/api/auth/changePassword?adminReset=true&&_id=${employee.getId()}`)
        .send({...changePasswordBody,newPassword:"Test1234$"})
        .set({ Authorization: `Bearer ${employee.getAccessToken()}` })
        .expect(httpStatus.OK)
        .then((res, req = {}) => {
          expect(res.body).to.deep.equal(
            getErrorResponseByKey("currentOldSameMsg")
          );
          done();
        })
        .catch(done);
    });
});

describe('## NEW PASSWORD AND CONFIRM PASSWORDS ARE NOT MATCHED', () => {
    it('Employee ChangePassword :: SHOULD GET New password and confirm password not matched.', (done) => {
      request(app)
        .post(`/api/auth/changePassword?adminReset=true&&_id=${employee.getId()}`)
        .send({...changePasswordBody,confirmPassword:"fake"})
        .set({ Authorization: `Bearer ${employee.getAccessToken()}` })
        .expect(httpStatus.OK)
        .then((res, req = {}) => {
          expect(res.body).to.deep.equal(
            getErrorResponseByKey("passwordsNotMatched")
          );
          done();
        })
        .catch(done);
    });
});

describe('## CURRENT PASSWORD IS INCORRECT', () => {
    it('Employee ChangePassword :: SHOULD GET CURRENT PASSWORD IS INCORRECT', (done) => {
      request(app)
        .post(`/api/auth/changePassword?adminReset=true&&_id=${employee.getId()}`)
        .send({...changePasswordBody,currentPassword:"fake"})
        .set({ Authorization: `Bearer ${employee.getAccessToken()}` })
        .expect(httpStatus.OK)
        .then((res, req = {}) => {
          expect(res.body).to.deep.equal(
            getErrorResponseByKey("currentPasswordError")
          );
          done();
        })
        .catch(done);
    });
});

describe('## NEW PASSWORD IS REQUIRED', () => {
    it('Employee ChangePassword :: SHOULD GET NEW PASSWORD IS REQUIRED', (done) => {
      request(app)
        .post(`/api/auth/changePassword?adminReset=true&&_id=${employee.getId()}`)
        .send({...changePasswordBody,newPassword:undefined})
        .set({ Authorization: `Bearer ${employee.getAccessToken()}` })
        .then((res, req = {}) => {
          expect(res.body).to.deep.equal(newPasswordNotProvided);
          done();
        })
        .catch(done);
    });
});

describe('## CHANGE PASSWORD SUCCESSFULLY', () => {
    it('Employee ChangePassword :: SHOULD GET PASSWORD CHANGED SUCCESSFULLY', (done) => {
      request(app)
        .post(`/api/auth/changePassword?adminReset=true&&_id=${employee.getId()}`)
        .send({...changePasswordBody})
        .set({ Authorization: `Bearer ${employee.getAccessToken()}` })
        .expect(httpStatus.OK)
        .then((res, req = {}) => {
          console.log("RES",res.body);
          expect(res.body).to.deep.equal(
            successResponseByEntity("passwordSuccess")
          );
          done();
        })
        .catch(done);
    });
});

describe('## DELETE THE Employee', () => {
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