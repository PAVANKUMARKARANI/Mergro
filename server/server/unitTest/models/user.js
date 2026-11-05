import fake from '../lib/fake';
import serviceUtill from '../../utils/service.util';

function User(options = {}) {
  var firstName = options.firstName || fake.name();
  var lastName = options.lastName || fake.name();
  var email = options.email || fake.email();
  var phone = options.phone || fake.phone({ formatted: false });
  var password = options.password || "User1234$";
  var changePassword = options.changePassword || "user@123"
  var entityType = options.entityType || "user";
  var accessToken = options.accessToken || "";
  var newPhone = options.newPhone || fake.phone({ formatted: false });
  var newFirstName = options.firstName || fake.name();
  var newLastName = options.lastName || fake.name();
  var newEmail = options.email || fake.email();
  var id = options.employeeId || "";

  this.getFirstName = function getFirstName() {
    return firstName;
  };

  this.getLastName = function getLastName() {
    return lastName;
  };

  this.getNewFirstName = function getNewFirstName() {
    return newFirstName;
  };

  this.getNewLastName = function getNewLastName() {
    return newLastName;
  };

  this.getEmail = function getEmail() {
    return email;
  };

  this.getNewEmail = function getNewEmail() {
    return newEmail;
  };

  this.getPhone = function getPhone() {
    return phone;
  };

  this.getNewPhone = function getNewPhone() {
    return newPhone;
  };

  this.getEntityType = function getEntityType() {
    return entityType;
  };

  this.getAccessToken = function getAccessToken() {
    return accessToken;
  };

  this.getPassword = function getPassword() {
    return password;
  };
  this.getChangePassword = function getChangePassword() {
    return changePassword
  };

  this.setAccessToken = function setAccessToken(newAccessToken) {
    accessToken = newAccessToken;
  };

  this.getEnmail = function getEnmail() {
    return serviceUtill.encodeString(email);
  };

  this.getId = function getId() {
    return id;
  };

  this.setId = function setId(newId) {
    id = newId;
  }

}

export default User;
