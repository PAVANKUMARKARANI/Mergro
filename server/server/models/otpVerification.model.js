import Promise from "bluebird";
import mongoose from "mongoose";
import httpStatus from "http-status";
import APIError from "../helpers/APIError";

const Schema = mongoose.Schema;

/**
 * Default Scheamas
 */
let defaultSchemaValues = {
	/**@DefaultFields */
	created: {
		type: Date,
		default: Date.now,
	},
	updated: {
		type: Date,
	},
	active: {
		type: Boolean,
		default: true,
	},
	createdByName: String,
	updatedByName: String,
	createdBy: Schema.Types.ObjectId,
	updatedBy: Schema.Types.ObjectId,
	email:String,
	otp:String,
	type:String,
	expires:Date,
};

/**
 * OtpVerfication Schema
 */
const OtpVerficationSchema = new mongoose.Schema(
	{
		...defaultSchemaValues,
	},
	{ usePushEach: true }
);

/**
 * Statics
 */
OtpVerficationSchema.statics = {
	/**
	 * save and update otpVerfication
	 * @param otpVerfication
	 * @returns {Promise<OtpVerfication, APIError>}
	 */
	saveData(otpVerfication) {
		return otpVerfication.save().then((otpVerfication) => {
			if (otpVerfication) {
				return otpVerfication;
			}
			const err = new APIError("Error in otpVerfication", httpStatus.NOT_FOUND);
			return Promise.reject(err);
		});
	},

	/**
	 * Get otpVerfication
	 * @param {ObjectId} id - The objectId of otpVerfication.
	 * @returns {Promise<OtpVerfication, APIError>}
	 */
	get(id) {
		return this.findById(id)
			.exec()
			.then((otpVerfication) => {
				if (otpVerfication) {
					return otpVerfication;
				}
				const err = new APIError(
					"No such otpVerfication exists!",
					httpStatus.NOT_FOUND
				);
				return Promise.reject(err);
			});
	},

	/**
	 * List otpVerfication in descending order of 'createdAt' timestamp.
	 * @returns {Promise<OtpVerfication[]>}
	 */
	list(query) {
		return this.find(query.otpVerfication)
			.sort(query.sorting)
			.skip((query.page - 1) * query.limit)
			.limit(query.limit)
			.exec();
	},
	/**
	 * Count of otpVerfication records
	 * @returns {Promise<OtpVerfication[]>}
	 */
	totalCount(query) {
		return this.find(query.otpVerfication).countDocuments();
	},
};

/**
 * @typedef OtpVerfication
 */
export default mongoose.model("OtpVerfication", OtpVerficationSchema);
