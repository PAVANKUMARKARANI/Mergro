/**
 * Generates a description string for the given object by formatting its properties.
 *
 * @param {Object} body - The object containing key-value pairs to format into a description.
 *                       Excludes specific fields like 'createdBy', '_id', and others.
 * @returns {string} - A formatted string representing the object's non-null, non-empty, and relevant fields.
 */

export const createDescription = (body) => {
  // List of fields to exclude
  const excludedFields = [
    'createdBy', 'createdByName', 'created', 'active', '__v', 'updated', '_id', 
    'listPreferences', 'isTwoFactorAuthentication', 'isRemember', 'enableTwoFactAuth', 'isEnabled', 'password', 'salt',
    'updatedByName', 'contextType'
  ];
    // Helper function to format nested objects
    const formatValue = (value) => {
      if (Array.isArray(value)) {
        // Convert array to a comma-separated string
        return value
        .map((item) => (typeof item === "object" ? formatValue(item) : item))
        .join("\n");
      } else if (typeof value === "object" && value !== null) {
        // Recursively format nested objects
        return Object.entries(value)
          .filter(([key]) => !excludedFields.includes(key)) // Exclude specific fields
          .map(([key, val]) => `${key}: ${formatValue(val)}`)
          .join("\n");
      }
      return value;
    };
    
  // Construct the description with label: value format, each on a new line
  const details = Object.entries(body)
    .filter(([key, value]) => value !== null && value !== '' && value !== undefined && !excludedFields.includes(key))
    .map(([key, value]) => `${key} :  ${formatValue(value)}`)
    .join('\n');

  return `${details}`;

};

/**
 * Generates a description string for a list of deleted items, formatting each item's properties.
 *
 * @param {Array<Object>} deletedItems - An array of objects representing the deleted items.
 *                                       Converts Mongoose documents to plain objects and excludes specific fields.
 * @returns {string} - A formatted string describing each deleted item's non-null, non-empty, and relevant fields.
 */

export const deleteDescription = (deletedItems) => {

  // List of fields to exclude
  const excludedFields = [
    'createdBy', 'createdByName', 'created', 'active', '__v', 'updated', '_id', 
    'listPreferences', 'isTwoFactorAuthentication', 'isRemember', 'enableTwoFactAuth', 'isEnabled', 'password', 'salt',
    'updatedByName', 'contextType'
  ];

  // Helper function to format nested objects
  const formatValue = (value) => {
    if (Array.isArray(value)) {
      // Convert array to a comma-separated string
      return value
        .map((item) => (typeof item === "object" ? formatValue(item) : item))
        .join("\n");
    } else if (typeof value === "object" && value !== null) {
      // Handle ObjectId specifically
      if (value._bsontype === "ObjectID") {
        return value.toString(); // Convert ObjectId to string
      }
      // Recursively format nested objects
      return Object.entries(value)
        .filter(([key]) => !excludedFields.includes(key)) // Exclude specific fields
        .map(([key, val]) => `${key}: ${formatValue(val)}`)
        .join("\n");
    }
    return value; // Return the value for other data types
  };
  console.log("deletedItems::::::::::::::::::",deletedItems);

  // Convert each item to a plain object to avoid Mongoose metadata properties
  const details = deletedItems.map((item) => {
    // Convert Mongoose document to plain object
    const plainItem = item.toObject ? item.toObject() : item;

    const itemDetails = Object.entries(plainItem)
      .filter(([key, value]) => value !== null && value !== '' && value !== undefined) // Filter out null, empty, or undefined values
      .filter(([key]) => !excludedFields.includes(key)) // Exclude specific fields
      .map(([key, value]) => `${key} : ${formatValue(value)}`)
      .join("\n");

    return `{ ${itemDetails} }`;
  }).join("\n\n\n");

  return `${details}`;
};

