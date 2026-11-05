import Promise from "bluebird";
import crypto from "crypto";
import httpStatus from "http-status";
import mongoose from "mongoose";
import mongooseFloat from "mongoose-float";
import { getDynamicSchemaFields } from "../helpers/dynamicSchemaHelper";
import APIError from "../helpers/APIError";

const Float = mongooseFloat.loadType(mongoose);
const Schema = mongoose.Schema;

const EmployeesSchemaJson = require("../schemas/employee.json");

/**
 * Default Scheamas
 */
let defaultSchemaValues = {
  password: String,
  salt: String,
  forgotPasswordExpireTimeStamp: Number,
  photo: Array,
  email: String,
  base32Secrect: String,
  role: { type: String, default: "" },
  created: {
    type: Date,
  },
  updated: {
    type: Date,
  },
  firstTimeLogin: {
    type: Boolean,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.ObjectId,
  },
  createdByName: String,
  updatedByName: String,
  listPreferences: {
    type: Schema.Types.ObjectId,
    ref: "ListPreferences",
  },
  isTwoFactorAuthentication: {
    type: Boolean,
    default: false,
  },
  otp: String,
  otpExpires: Date,
  isRemember: {
    type: Boolean,
    default: false,
  },
  isRememberLogin: Date,
  enableTwoFactAuth: {
    type: Boolean,
    default: true,
  },
  photoUrl: String,
  isGoogleUser: { type: Boolean },
  reportingTo: {
    type: Schema.ObjectId,
    ref: "Employees",
  },
  reportingToSearch: String,
};

/**
 * Employees Schema
 */
const dynamicSchemaFields = getDynamicSchemaFields(
  "employee",
  defaultSchemaValues,
  EmployeesSchemaJson
);

const EmployeesSchema = new mongoose.Schema(
  {
    ...defaultSchemaValues,
    ...EmployeesSchemaJson,
    ...dynamicSchemaFields,
  },
  { usePushEach: true }
);

/**
 * Hook a pre save method to hash the password
 */
EmployeesSchema.pre("save", function (next) {
  if (this.password && this.isModified("password")) {
    this.salt = crypto.randomBytes(16).toString("base64");
    this.password = this.hashPassword(this.password);
  }

  next();
});

/**
 *
 * @Function
 * @ForValidations (preValidatorSchema)
 *
 */
function preValidatorSchema(thisObj, next) {
  if (!thisObj) {
    const validationError = new APIError("failed to save user data.");
    validationError.name = "mongoFieldError";
    next(validationError);
  } else {
    /**@Remove the *(star) it will work */
    //*preRequired
    //*preValidator
  }
}

/**
 * Hook a pre validate method to employee the local password
 */
EmployeesSchema.pre("validate", function (next) {
  if (
    this.provider === "local" &&
    this.password &&
    this.isModified("password")
  ) {
    let result = owasp.employee(this.password);
    if (result.errors.length) {
      let error = result.errors.join(" ");
      this.invalidate("password", error);
    }
  }
  preValidatorSchema(this, next);

  next();
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
EmployeesSchema.methods = {
  /**
   * Create instance method for authenticating employee
   * @param {password}
   */
  authenticate(password) {
    return this.password === this.hashPassword(password);
  },

  /**
   * Create instance method for hashing a password
   * @param {password}
   */
  hashPassword(password) {
    if (this.salt && password) {
      return crypto
        .pbkdf2Sync(
          password,
          Buffer.from(this.salt, "base64"),
          10000,
          64,
          "SHA1"
        )
        .toString("base64");
    } else {
      return password;
    }
  },
};

EmployeesSchema.statics = {
  /**
   * save and update Employees
   * @param Employees
   * @returns {Promise<Employees, APIError>}
   */
  saveData(employee) {
    return employee.save().then((employee) => {
      if (employee) {
        return employee;
      }
      const err = new APIError("error in employee", httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  /**
   * List employee in descending order of 'createdAt' timestamp.
   * @returns {Promise<employee[]>}
   */
  list(query) {
    return this.find(query.filter, query.dbfields)
      .populate("reportingTo", "name ")
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .collation({ locale: "en", strength: 2 })
      .exec();
  },

  /**
   * Count of employee records
   * @returns {Promise<employee[]>}
   */
  totalCount(query) {
    return this.find(query.filter).countDocuments();
  },
  /**
   * Get employee
   * @param {ObjectId} id - The objectId of employee.
   * @returns {Promise<employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate("reportingTo", "name ")
      .exec()
      .then((employee) => {
        if (employee) {
          return employee;
        }
        const err = new APIError(
          "No such employee exists",
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  /**
   * Find unique email.
   * @param {string} email.
   * @returns {Promise<Employees[]>}
   */
  findUniqueEmail(email) {
    email = email.toLowerCase();
    return this.findOne({
      email: email,
      active: true,
    })
      .populate("listPreferences", "columnOrder")
      .exec()
      .then((employee) => employee);
  },
};

export default mongoose.model("Employees", EmployeesSchema);
