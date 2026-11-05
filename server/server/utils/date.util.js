import moment from 'moment';
import momentTimezone from 'moment-timezone';
const defaultFormat = 'YYYY-MM-DD';
const defaultYearFormat = 'YYYY';
const defaultDateTimeFormat = 'YYYY-MM-DDTHH:mm:ss';

const getTodayDate = (format = defaultFormat) => {
  return moment.utc().format(format);
}

const getTodayDateAndTime = () => {
  return moment.utc().format(defaultDateTimeFormat);
}

const getYesterdayDate = (format = defaultFormat) => {
  return moment.utc().add(-1, 'day').format(format);
}
const getWeekBeforeDate = (format = defaultFormat) => {
  return moment.utc().add(-1, 'week').format(format);
}

const formatDate = (date, format = defaultFormat) => {
  return moment(new (date)).format(format)
}

const getFutureDate = (days, day) => {
  let date = moment().add(days, 'days').format(defaultFormat);
  if (day)
    date = moment(new Date(day)).add(days, 'days').format(defaultFormat);
  return date;
}

const formatYear = (date) => {
  let year = moment().format(defaultFormat);
  if (year)
    year = moment(new Date(date)).format(defaultYearFormat);
  return year;
}

const getOneDayQuery = () => {
  let todayDate = moment(new Date()).format(defaultFormat);
  return { $lte: new Date(todayDate + 'T23:59:59Z'), $gte: new Date(todayDate + 'T00:00:00Z') };
}
const getThisWeekQuery = () => {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth();
  let d = date.getDate();
  let firstDay = moment(new Date(y, m, d)).format('YYYY-MM-DD') + 'T23:59:59Z';
  let lastDay = moment(new Date(y, m, d - 7)).format('YYYY-MM-DD') + 'T00:00:00Z';
  return { $lte: new Date(firstDay), $gte: new Date(lastDay) };
}

const getThisMonthDatesQuery = () => {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth();
  let firstDay = moment(new Date(y, m, 1)).format('YYYY-MM-DD') + 'T00:00:00Z';
  let lastDay = moment(new Date(y, m + 1, 0)).format('YYYY-MM-DD') + 'T00:00:00Z';
  return { $lte: new Date(lastDay), $gte: new Date(firstDay) };
}

const getOneMonthDatesQuery = () => {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth();
  let d = date.getDate();
  let firstDay = moment(new Date(y, m, d)).format('YYYY-MM-DD') + 'T23:59:59Z';
  let lastDay = moment(new Date(y, m, d - 30)).format('YYYY-MM-DD') + 'T00:00:00Z';
  return { $lte: new Date(firstDay), $gte: new Date(lastDay) };
}

const getLastMonthDatesQuery = () => {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth();
  let firstDay = moment(new Date(y, m - 1, 1)).format('YYYY-MM-DD') + 'T00:00:00Z';
  let lastDay = moment(new Date(y, m, 0)).format('YYYY-MM-DD') + 'T00:00:00Z';
  return { $lte: new Date(firstDay), $gte: new Date(lastDay) };
}

const getThreeMonthsQuery = () => {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth();
  let d = date.getDate();
  let firstDay = moment(new Date(y, m, d)).format('YYYY-MM-DD') + 'T23:59:59Z';
  let lastDay = moment(new Date(y, m, d - 90)).format('YYYY-MM-DD') + 'T00:00:00Z';
  return { $lte: new Date(firstDay), $gte: new Date(lastDay) };
}

const getLastMinuteQuery = () => {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth();
  let d = date.getDate();
  let h = date.getHours();
  let mnts = date.getMinutes();
  let seconds = date.getSeconds();
  let newSeconds = seconds - 60;
  let presentMinuteDate = moment(new Date(y, m, d, h, mnts, seconds)).toISOString();
  let lastMinuteDate = moment(new Date(y, m, d, h, mnts - 1, Math.abs(newSeconds))).toISOString();
  return { $gte: new Date(lastMinuteDate), $lt: new Date(presentMinuteDate) };
}

const getLast60MinutesQuery = () => {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth();
  let d = date.getDate();
  let h = date.getHours();
  let mnts = date.getMinutes();
  let seconds = date.getSeconds();
  let newMnts = mnts - 60;
  let presentMinuteDate = moment(new Date(y, m, d, h, mnts, seconds)).toISOString();
  let last60MinuteDate = moment(new Date(y, m, d, h - 1, Math.abs(newMnts), seconds)).toISOString();
  return { $gte: new Date(last60MinuteDate), $lt: new Date(presentMinuteDate) };
}

const getLastHourQuery = () => {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth();
  let d = date.getDate();
  let h = date.getHours();
  let mnts = date.getMinutes();
  let seconds = date.getSeconds();
  let presentMinuteDate = moment(new Date(y, m, d, h, mnts, seconds)).toISOString();
  let lastMinuteDate = moment(new Date(y, m, d, h - 1, mnts, seconds)).toISOString();
  return { $gte: new Date(lastMinuteDate), $lt: new Date(presentMinuteDate) };
}


const getLast24HoursQuery = () => {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth();
  let d = date.getDate();
  let h = date.getHours();
  let mnts = date.getMinutes();
  let seconds = date.getSeconds();
  let newHour = h - 24;
  let presentDate = moment(new Date(y, m, d, h, mnts, seconds)).toISOString();
  let lastDate = moment(new Date(y, m, d - 1, Math.abs(newHour), mnts, seconds)).toISOString();
  return { $gte: new Date(lastDate), $lt: new Date(presentDate) };
}

const getOrderExpiryDateQuery = (diffDays) => {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth();
  let d = date.getDate();
  let h = date.getHours();
  let mnts = date.getMinutes();
  let seconds = date.getSeconds();
  let expDate = moment(new Date(y, m, d - diffDays, h, mnts, seconds)).toISOString();
  return { $lt: new Date(expDate) };
}

export default {
  getTodayDate,
  getTodayDateAndTime,
  getYesterdayDate,
  getFutureDate,
  formatDate,
  formatYear,
  getOneDayQuery,
  getThisWeekQuery,
  getThisMonthDatesQuery,
  getLastMonthDatesQuery,
  getThreeMonthsQuery,
  getWeekBeforeDate,
  getOneMonthDatesQuery,
  getLastMinuteQuery,
  getLast24HoursQuery,
  getOrderExpiryDateQuery,
  getLast60MinutesQuery,
  getLastHourQuery
};