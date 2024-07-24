//require settings to server
require('./config/config');

// Libraries and frameworks
const SocketIO = require('socket.io-client');

//const { db } = require('./database/index');

// Webserver

global.io1 = SocketIO.connect(process.env.API_URL_SOCKET+'/cards', {
    transports: ['websocket']
})

//Hardware controller
const { cardSocket } = require('./hardware/index');
cardSocket.init(io1);

require('./hardware/core');
