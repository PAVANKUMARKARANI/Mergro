import winston from 'winston';
import winstonRedisInit from 'winston-redis';
require('winston-daily-rotate-file');

import config from './config';

const winstonRedis = winstonRedisInit;

// TR: console'da sadece hepsi tutuluyor olacak çünkü info log seviyesinden sonra diğer tüm log seviyeleri sıralanmış
// EN: all log level will be shown in Console, because 'info' is on the top of list with 0 value.
let logLevelConsole = 'warn', logLevel = 'debug', logName = 'lando'
var transportConsole = new winston.transports.Console({
  json: true, timestamp: true, prettyPrint: true, colorize: true, level: 'info',

  timestamp: () => dayjs().format('HH:mm:ss'),
  formatter: options => {
    // Get da prefixes
    const element = (logName === 'lando') ? 'lando' : logName;
    const elementColor = (logName === 'lando') ? 'lando' : 'app';
    // Set the leftmost colum width
    fcw = _.max([fcw, _.size(element)]);
    // Default output
    const output = [
      winston.config.colorize(elementColor, _.padEnd(element.toLowerCase(), fcw)),
      winston.config.colorize('timestamp', options.timestamp()),
      winston.config.colorize(options.level, options.level.toUpperCase()),
      '==>',
      util.format(options.message),
      serialize(options.meta),
    ];
    // If this is a warning or error and we arent verbose then omit prefixes
    if (_.includes(userLevels, options.level) && _.includes(userLevels, logLevelConsole)) {
      return _.drop(output, 2).join(' ');
    }
    return output.join(' ');
  },
  label: 'lando',
  level: 'warn',
  colorize: true,

}),

  // TR: File'da sadece i ve db tutuluyor olacak çünkü i den sonra db log seviyesi sıralanmış
  // EN: 'i' and 'db' log levels will be shown in File, because db is after i and for File transport level is 'i'
  // transportFileDebug = new winston.transports.File({ filename: 'logs/debug.log', json: true }),
  // transportFileException = new winston.transports.File({ filename: 'logs/exceptions.log', json: false }),

  // TR: rediste sadece db tutuluyor olacak çünkü db den sonra bir log seviyesi yok
  // EN: only 'db' will be stored in rediste because 'db' is the last one 
  transportRedis = new (winstonRedis)({ host: '127.0.0.1', port: 6379, level: 'db' });

var transportDateDebug = new winston.transports.DailyRotateFile({
  json: true, timestamp: true, prettyPrint: true, colorize: true, level: 'info',
  filename: 'logs/debug/%DATE%log', datePattern: 'YYYY-MM-DD.', prepend: true
});
var transportDateException = new winston.transports.DailyRotateFile({ filename: 'logs/exceptions/%DATE%log', datePattern: 'YYYY-MM-DD.', prepend: true });
var logger = winston.createLogger({
  levels: {
    info: 2,
    warn: 1,
    error: 0,
    verbose: 3,
    i: 4,
    db: 5
  },
  transports: [
    // new winston.transports.DailyRotateFile({
    //   filename: './logs/user-login/log',
    //   datePattern: 'yyyy-MM-dd.',
    //   prepend: true
    // }),
    transportConsole,
    // transportFileDebug,
    transportDateDebug,
    // transportRedis
  ],
  exceptionHandlers: [
    transportConsole,
    // transportFileException,
    transportDateException
  ],
  exitOnError: false
});

winston.addColors({
  info: 'green',
  warn: 'cyan',
  error: 'red',
  verbose: 'blue',
  i: 'gray',
  db: 'magenta'
});


function traceCaller(n) {
  if (isNaN(n) || n < 0) n = 1;
  n += 1;
  var s = (new Error()).stack
    , a = s.indexOf('\n', 5);
  while (n--) {
    a = s.indexOf('\n', a + 1);
    if (a < 0) { a = s.lastIndexOf('\n', s.length); break; }
  }
  let b = s.indexOf('\n', a + 1); if (b < 0) b = s.length;
  a = Math.max(s.lastIndexOf(' ', b), s.lastIndexOf('/', b));
  b = s.lastIndexOf(':', b);
  s = s.substring(a + 1, b);
  return s;
}

function checkValidLog(type) {
  let process = false;
  if (type && config.isLoggerValidEnable) {
    if (global.settings && global.settings.logs) {
      if (global.settings.logs.indexOf(type) !== -1) {
        process = true;
      }
    } else {
      process = true
    }
  } else {
    process = true;
  }
  return process;
}

//// **help me to add line number**
let logger_info_old = logger.info;
logger.info = async function (msg, type) {
  if (checkValidLog(type)) logger_info_old(traceCaller(1) + " : " + msg);
};

let logger_debug_old = logger.debug;
logger.debug = function (msg, type) {
  if (checkValidLog(type)) return logger_debug_old(traceCaller(1) + " : " + msg);
};

let logger_error_old = logger.error;
logger.error = function (msg, type) {
  if (checkValidLog(type)) return logger_error_old(traceCaller(1) + " : " + msg);
};

let logger_warn_old = logger.warn;
logger.warn = function (msg, type) {
  if (checkValidLog(type)) return logger_warn_old(traceCaller(1) + " : " + msg);
};

let logger_db_old = logger.db;
logger.db = function (msg, type) {
  if (checkValidLog(type)) return logger_db_old(traceCaller(1) + " : " + msg);
};


export default logger;
