const Comunicator = require('../')

const SOCKET = Comunicator.connect('ws://127.0.0.1:8444')

// Test invalid listener
/*
SOCKET.on('lance2', (data) => {
  console.log('Action on \'lance2\' whit data: ', data)
})*/

SOCKET.on('lance', (data) => {
  console.log('Action on \'lance\' whit data: ', data)
})
