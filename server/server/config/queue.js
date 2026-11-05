import async from 'async';

global.socketQueue = [];
global.inProcess = false;
global.orderQueue = async.queue(function (orderObj, callback) {
  // tradeEngineService().onOrderPlaced(orderObj.order, orderObj.action, function () {
  //   callback();
  // });
}, 1);

// assign a callback
orderQueue.drain = function () {
  logger.info('all orders have been processed');
};