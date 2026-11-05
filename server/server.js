import mongoose from 'mongoose';
import util from 'util';


// config should be imported before importing any other file
import config from './server/config/config';
// import app from './server/config/express';
import app from '../server/server/config/express';

const debug = require('debug')('express-mongoose-es6-rest-api:index');

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

// connect to mongo db
const mongoUri = config.mongo.host;

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('error', () => {
  // Never print the URI: it contains the database password.
  throw new Error('unable to connect to database (check MONGO_HOST in server/.env)');
});

// print mongoose logs in dev env
if (config.MONGOOSE_DEBUG) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}
// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912

// listen on port config.port
var server = app.listen(config.port, () => {
  console.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console
});

server.timeout = 60 * 60 * 1000;

export default app;
