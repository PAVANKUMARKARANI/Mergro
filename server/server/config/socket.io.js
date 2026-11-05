'use strict';
// Load the module dependencies
import http from 'http';
import SocketIO from 'socket.io';
// import redis from 'socket.io-redis';
// import socketEmitter from 'socket.io-emitter';
// import socketBeforeService from '../services/socket.before.service';
import config from './config';
let io;
let userSocketMap = {};

// Define the Socket.io configuration method
export default {
  init: (app) => {
    // create socket server
    let server = http.createServer(app);

    // initialize socket io
    io = SocketIO(server);

    // broad case adapter b/w multiple nodes or multiple servers
    //    io.adapter(redis({ host: 'localhost', port: 6379 }));

    // emit the data from active and non active instances
    //    let ioNew = socketEmitter({ host: 'localhost', port: 6379 });

    // Add an event listener to the 'connection' event
    io.on('connect', (socket) => {

      // when socket connected or disconnected
      let handshakeData = socket.request;
      if (handshakeData && handshakeData._query && handshakeData._query.params) {
        if (typeof handshakeData._query.params === 'string') {
          let params = JSON.parse(handshakeData._query.params);
          if (params.pair) {
            subscribeRoom({ io: io, socket: socket, data: params });
          }
        }
      }

      // initial user connect
      socket.on('userConnected', (data) => {
        // socket connected based on logi userId or bearer token
        addUserSocketMap(data, socket);
        // send user stats by socket when connecting a user
        socketBeforeService.sendStatsSummaryByUser({ io: io, socket: socket, data: data });
      });

      // join room
      socket.on('subscribeRoom', (data) => {
        subscribeRoom({ io: io, socket: socket, data: data });
      });
      // leave room
      socket.on('unsubscribeRoom', (data) => {
        unsubscribeRoom({ io: io, socket: socket, data: data });
      });

      // when the user disconnects.. perform this
      socket.on('disconnect', () => {
        console.log(`Disconnected ${socket.id}`);
        // delete socket mapping
        deleteUserSocketMap(socket);
        // send live users count to admin users by socket
        let dashboardParams = {
          io: io,
          socket: socket,
          data: {
            sendLiveUsers: true
          }
        };
        socketBeforeService.sendStatsForAdminDashboard(dashboardParams);
      });

    });

    return server;
  },
  getIo: () => {
    return io;
  },
  getUserSocketMap: () => {
    return userSocketMap;
  }
}


// add user socket map
async function addUserSocketMap(data, socket) {
  try {
    if (data.token) {
      data.userId = await socketBeforeService.getUserdetailsFromToakenForSockets(data.token);

      if (data.userId) {
        let userId = data.userId;
        let socketId = socket.id;
        socket.userId = userId;
        // check user -> socket mapping (unique socket mapping)
        if (userSocketMap[userId] && userSocketMap[userId].indexOf(socketId) === -1) {
          userSocketMap[userId].push(socketId);
        }
        // no userid socket map connection
        if (!userSocketMap[userId]) {
          userSocketMap[userId] = [socketId];
        }
      }
    }
  } catch (err) {
    console.log('error occured ' + err);
  }
}

// delete user socket map
function deleteUserSocketMap(socket) {
  try {
    let socketId = socket.id;
    let userId = socket.userId;
    if (userId) {
      let sids = userSocketMap[userId];
      if (sids && sids.length > 0) {
        let index = sids.indexOf(socketId);
        if (index > -1) {
          sids.splice(index, 1);
        }
      }
      if (userSocketMap[userId] && userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
      }
    }
  } catch (err) {
    console.log('error occured' + err);
  }
}

// subscribe room
function subscribeRoom({ io, socket, data }) {
  let newPair = data.pair;

  // check pair if passed or not
  if (!newPair) {
    socket.emit('requiredPair', { errorCode: "9001", errorMessage: 'Pair is required' });
    return;
  }

  // If userId passed
  if (data.userId) {
    addUserSocketMap(data, socket);
  }

  // delete exisiting pair
  let delPair;
  Object.keys(socket.rooms).forEach((key) => {
    if (socket.rooms[key] !== socket.id && key !== newPair) {
      delPair = key;
    }
  });
  if (delPair && socket.rooms) {
    delete socket.rooms[delPair];
  }
  // join room
  if (!socket.rooms[newPair]) {
    socket.join(newPair);
  }
  let dashboardParams = {
    io: io,
    socket: socket,
    data: data
  };
  // send pair stats by socket when connecting a user
  if (newPair === config.adminRoomName) {
    if (!dashboardParams.data) {
      dashboardParams.data = {};
    }
    dashboardParams.data.allDashboardStats = true;
    socketBeforeService.sendStatsForAdminDashboard(dashboardParams);
  } else {
    socketBeforeService.sendStatsSummaryByPair(dashboardParams);
  }
}


// leave room
function unsubscribeRoom({ socket, data }) {
  let newPair = data.pair;
  // leave room
  if (socket.rooms && socket.rooms[newPair]) {
    socket.leave(newPair);
  }
  // send status to client
  socket.emit("unsubscribeRoom", {
    respMessage: 'Pair disconnected (' + newPair + ')'
  });
}