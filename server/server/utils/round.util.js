import config from '../config/config';

export default {
  getRoundAmount(...args) {
    try {
      let fixNum = config.fixNum || 8;
      let amt1, amt2, operation, fixNum1, fixNum2;
      if (args.length === 0) {
        logger.error('round', "No args found");
        return 0;
      }
      args.forEach((arg, index) => {
        if (index === 0) {
          if (typeof arg === 'object') {
            amt1 = arg.amt1;
            amt2 = arg.amt2;
            operation = arg.operation || 'add';
            if (arg && arg.fixNum) {
              fixNum = arg.fixNum;
            }
            if (arg && arg.fixNum1) {
              fixNum1 = arg.fixNum1;
            }
            if (arg && arg.fixNum2) {
              fixNum2 = arg.fixNum2;
              fixNum = fixNum2;
            }

          } else {
            amt1 = arg;
          }
        }
        if (index === 1) {
          amt2 = arg;
        }
        if (index === 2) {
          operation = arg || 'add';
        }
      });

      if (typeof amt1 === 'undefined') {
        amt1 = 0;
      }
      if (typeof amt2 === 'undefined') {
        amt2 = 0;
      }
      if (fixNum1) {
        amt1 = Number((amt1).toFixed(fixNum1));
      }
      if (fixNum2) {
        amt2 = Number((amt2).toFixed(fixNum2));
      }
      if (operation === 'sub') {
        return Number((amt1 - amt2).toFixed(fixNum));
      } else if (operation === 'mul') {
        return Number((amt1 * amt2).toFixed(fixNum));
      } else if (operation === 'div') {
        return Number((amt1 / amt2).toFixed(fixNum));
      } else {
        return Number((amt1 + amt2).toFixed(fixNum));
      }
    } catch (err) {
      logger.error('round', "Error in to round amount");
    }
  },
  toAmount(amt, fixedNum) {
    if (typeof amt === 'undefined') {
      return 0;
    }
    let fixNum = fixedNum || config.fixNum || 8;
    return Number((amt).toFixed(fixNum));
  }
}
