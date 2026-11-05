import bluebird from 'bluebird';
import bodyParser from 'body-parser';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import expressStatic from 'express-static';
import expressWinston from 'express-winston';
import helmet from 'helmet';
import httpStatus from 'http-status';
import logger from 'morgan';
import appRoot from 'app-root-path';
import path from 'path';
import methodOverride from 'method-override';
import redis from 'redis';

import config from './config';
import errorHandler from './errorHandler';
import socketIo from './socket.io';
import winstonInstance from './winston';

import routes from '../routes/index.route';

import serviceUtil from '../utils/service.util';

/**@ApiStatsMiddlewareImport */
import apistats from '../middlewares/apistats';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../swaggerApis/swaggerConfig'

/**@ValidatorImport */
// import schemaFieldsValidator from '../middlewares/schemaFieldsValidator'

/**@Rate limiter */
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after a minute'
});


bluebird.promisifyAll(redis);
const REDIS_PORT = process.env.REDIS_PORT || 6379;

// set global variable
global.redisClient = redis.createClient(REDIS_PORT);
global.logger = winstonInstance;
global.settings = {};
const app = express();

if (config.env === 'development') app.use(logger('dev'));

// parse body params and attache them to req.body
app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());


// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// enable detailed API logging in dev env
expressWinston.requestWhitelist.push('body');
expressWinston.responseWhitelist.push('body');
app.use(expressWinston.logger({
  winstonInstance,
  meta: true, // optional: log meta data about request (defaults to true)
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
}));

/**@ApplyStatsMiddleware */
app.use(apistats)

/**@ValidatorMiddleware */
// app.use(schemaFieldsValidator)

var rootFolder = require('path').resolve(__dirname, '..')
console.log("appRoot.path", rootFolder)
app.use('/images', express.static(path.join(rootFolder, 'upload')));

app.use('/docs', expressStatic(config.path));

app.use('/html', expressStatic(config.viewsExtension));

// remove unknown req.body fields
app.use(serviceUtil.removeBodyFields);

//secure api from post man platfrom operations
app.use(serviceUtil.secureApi)

/**@swagger middleware */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

/**@RatelimitterMiddleware */
app.use('/api', limiter); 

app.use('/api', routes);

app.get('', (req, res) => {
  res.redirect(config.serverUrl + 'html/welcome.html');
});

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  errorHandler(err, req, res, next);
});
// catch 404 and forward to error handler
app.use((req, res) => {
  res.redirect(config.serverUrl + 'html/apiNotFound.html');
});


// log error in winston transports except when executing test suite
if (config.env !== 'test') app.use(expressWinston.errorLogger({ winstonInstance }));

// error handler, send stacktrace only during development
app.use((err, req, res, next) => // eslint-disable-line no-unused-vars
  res.status(err.status).json({
    message: err.isPublic ? err.message : httpStatus[err.status],
    stack: config.env === 'development' ? err.stack : {}
  })
);

// initializing socket
let server = socketIo.init(app);

export default server;
