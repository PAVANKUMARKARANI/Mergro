const mongoose = require("mongoose");
const config = require("../config/config")

const connectToDb = async () => {
    // connect to mongo db
const mongoUri = config.default.mongo.host;
// Never log mongoUri: it contains the database password.
    mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true }).then(async () => {
        console.log("Connected to MongoDB");
        const ConfigureModel = require("../models/configureScreens.model").default;
        const configurations = await ConfigureModel.find({ active: true });
        global.configurations = configurations;
        require("../../server");
    }).catch((err) => {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1);
    })
}

connectToDb();