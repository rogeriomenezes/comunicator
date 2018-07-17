const Comunicator = require('../')
const WebSocket = require('ws');

const SOCKET = Comunicator.connect('ws://127.0.0.1:8444', null, WebSocket)

// Test invalid listener
/*
SOCKET.on('lance2', (data) => {
  console.log('Action on \'lance2\' whit data: ', data)
})*/

SOCKET.on('lance', (data) => {
  console.log('Action on \'lance\' whit data: ', data)
})

// Test close session
SOCKET.close()