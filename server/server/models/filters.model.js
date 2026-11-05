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
	isDefaultFilter: { type: Boolean },

	/**@Filter Fields */
	name: String, //Filter Name
	screenName: String,
	filterCriteria: String,
	jsonQuery: Object,
	primeFilterForAngular: Object,
	event: Object,
	defaultFilter: Boolean
};

/**
 * Filter Schema
 */
const FilterSchema = new mongoose.Schema(
	{
		...defaultSchemaValues,
	},
	{ usePushEach: true }
);

/**
 * Statics
 */
FilterSchema.statics = {
	/**
	 * save and update filter
	 * @param filter
	 * @returns {Promise<Filter, APIError>}
	 */
	saveData(filter) {
		return filter.save().then((filter) => {
			if (filter) {
				return filter;
			}
			const err = new APIError("Error in filter", httpStatus.NOT_FOUND);
			return Promise.reject(err);
		});
	},

	/**
	 * Get filter
	 * @param {ObjectId} id - The objectId of filter.
	 * @returns {Promise<Filter, APIError>}
	 */
	get(id) {
		return this.findById(id)
			.exec()
			.then((filter) => {
				if (filter) {
					return filter;
				}
				const err = new APIError(
					"No such filter exists!",
					httpStatus.NOT_FOUND
				);
				return Promise.reject(err);
			});
	},

	/**
	 * List filter in descending order of 'createdAt' timestamp.
	 * @returns {Promise<Filter[]>}
	 */
	list(query) {
		return this.find(query.filter)
			.sort(query.sorting)
			.skip((query.page - 1) * query.limit)
			.limit(query.limit)
			.collation({ locale: "en", strength: 2 })
			.exec();
	},
	/**
	 * Count of filter records
	 * @returns {Promise<Filter[]>}
	 */
	totalCount(query) {
		return this.find(query.filter).countDocuments();
	},
};

/**
 * @typedef Filter
 */
export default mongoose.model("Filter", FilterSchema);
