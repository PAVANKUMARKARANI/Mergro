const mongoose = require("mongoose");

const typeMapping = {
  text: "String",
  number: "Number",
  boolean: "Boolean",
  date: "Date",
  objectid: "mongoose.Schema.Types.ObjectId",
  dropdown: "Array",
  checkbox: "Boolean",
};

function getDynamicSchemaFields(modelName, defaultFields = {}, staticJsonFields = {}) {
  const dynamicFields = {};
  const configureScreens = global.configurations || [];

  for (const configureScreen of configureScreens) {
    if (configureScreen.screenName.toLowerCase() === modelName.toLowerCase()) {
      for (const field of configureScreen.screenFields) {
           if (!field.name || !field.type) {
          continue; // Skip fields without name or type
        }
        const fieldName = field.name;

        if (
          defaultFields.hasOwnProperty(fieldName) ||
          staticJsonFields.hasOwnProperty(fieldName) ||
          dynamicFields.hasOwnProperty(fieldName)
        ) {
          continue; // Skip duplicate fields
        }

        let mongooseType = typeMapping[field.type.toLowerCase()] || "String";
        if (field.type.toLowerCase() === "dropdown") {
          mongooseType = field.isMultiSelect ? "Array" : "String";
        }

        dynamicFields[fieldName] = {
          type: mongoose.Schema.Types[mongooseType] || String,
        };
      }
    }
  }

  return dynamicFields;
}

module.exports = { getDynamicSchemaFields };
