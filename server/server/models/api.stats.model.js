import Promise from "bluebird";
import mongoose from "mongoose";
import httpStatus from "http-status";
import APIError from "../helpers/APIError";

const Schema = mongoose.Schema;

/**
 * Default Scheamas
 */
let defaultSchemaValues = {
    originalUrl: String,
    query:Object,
    url:String,
    ip:String,
    method:String,
    path:String,
    body:Object,
    host:String,
    protocol:String,
    secure:Boolean,
    params:Object,
	created: {
		type: Date,
		default: Date.now,
	},
	updated: {
		type: Date,
	},

};

/**
 * ApiStats Schema
 */
const ApiStatsSchema = new mongoose.Schema(
	{
		...defaultSchemaValues,
	},
	{ usePushEach: true }
);

/**
 * Statics
 */
ApiStatsSchema.statics = {
	/**
	 * save and update apiStats
	 * @param apiStats
	 * @returns {Promise<ApiStats, APIError>}
	 */
	saveData(apiStats) {
		return apiStats.save().then((apiStats) => {
			if (apiStats) {
				return apiStats;
			}
			const err = new APIError("Error in apiStats", httpStatus.NOT_FOUND);
			return Promise.reject(err);
		});
	},

	/**
	 * Get apiStats
	 * @param {ObjectId} id - The objectId of apiStats.
	 * @returns {Promise<ApiStats, APIError>}
	 */
	get(id) {
		return this.findById(id)
			.exec()
			.then((apiStats) => {
				if (apiStats) {
					return apiStats;
				}
				const err = new APIError(
					"No such apiStats exists!",
					httpStatus.NOT_FOUND
				);
				return Promise.reject(err);
			});
	},

	/**
	 * List apiStats in descending order of 'createdAt' timestamp.
	 * @returns {Promise<ApiStats[]>}
	 */
	list(query) {
		return this.find(query.filter)
			.sort(query.sorting)
			.skip((query.page - 1) * query.limit)
			.limit(query.limit)
			.exec();
	},
	/**
	 * Count of apiStats records
	 * @returns {Promise<ApiStats[]>}
	 */
	totalCount(query) {
		return this.find(query.filter).countDocuments();
	},
};

/**
 * @typedef ApiStats
 */
export default mongoose.model("ApiStats", ApiStatsSchema);
