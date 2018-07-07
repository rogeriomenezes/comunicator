/**
 * Comunicador v1.0.0
 * Responsável pela comunicação realtime entre os sistemas de leilão
 * Author: Tiago Felipe <tiago@tiagofelipe.com>
 * +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=
 * Atualmente, esta aplicação depende de uma conexão websocket
 */

try {
  // for Node.js
  var autobahn = require('autobahn');
} catch (e) {
  // for browsers (where AutobahnJS is available globally)
}

var connection = new autobahn.Connection({url: 'ws://127.0.0.1:8444/', realm: 'realm1'});

connection.onopen = function (session) {

  // 1) subscribe to a topic
  function onevent(args) {
    console.log("Event:", args[0]);
  }
  session.subscribe('com.myapp.hello', onevent);

  // 2) publish an event
  session.publish('com.myapp.hello', ['Hello, world!']);

  // 3) register a procedure for remoting
  /*function add2(args) {
    return args[0] + args[1];
  }
  session.register('com.myapp.add2', add2);

  // 4) call a remote procedure
  session.call('com.myapp.add2', [2, 3]).then(
    function (res) {
      console.log("Result:", res);
    }
  );*/
};

connection.open();