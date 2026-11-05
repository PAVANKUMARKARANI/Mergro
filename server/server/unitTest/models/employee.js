import fake from '../lib/fake';
import serviceUtill from '../../utils/service.util';

function Employee(options = {}) {var email = options.email || fake.email();
var password = options.password || "User1234$";
var changePassword = options.changePassword || "user@123"
var entityType = options.entityType || "user";
var accessToken = options.accessToken || "";
var newPhone = options.newPhone || fake.phone({ formatted: false });
var newFirstName = options.firstName || fake.name();
var newLastName = options.lastName || fake.name();
var newEmail = options.email || fake.email();
var id = options.employeeId || "";

this.getId = function getId() {
  return id;
};

this.setId = function setId(newId) {
  id = newId;
}

this.getEntityType = function getEntityType() {
  return entityType;
};

this.getNewPhone = function getNewPhone() {
  return newPhone;
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

var email = options.email || fake.name();
this.getEmail = function getEmail() {
  return email;
};

this.getEnmail = function getEnmail() {
  return serviceUtill.encodeString(email);
};
var name = options.name || fake.name();
this.getName = function getName() {
  return name;
};
var email = options.email || fake.name();
this.getEmail = function getEmail() {
  return email;
};
var address = options.address || fake.name();
this.getAddress = function getAddress() {
  return address;
};
var role = options.role || fake.name();
this.getRole = function getRole() {
  return role;
};
var phone = options.phone || fake.name();
this.getPhone = function getPhone() {
  return phone;
};
var created = options.created || fake.date();
this.getCreated = function getCreated() {
  return created;
};
var updated = options.updated || fake.date();
this.getUpdated = function getUpdated() {
  return updated;
};

this.getfields = function getfields() { 
return {
name,
email,
address,
role,
phone,
created,
updated,
}; }}

export default Employee;