/**
 * Comunicador v1.0.0
 * Responsável pela comunicação realtime entre os sistemas de leilão
 * Esta biblioteca deve prover uma transparência entre a aplicação e o tipo de serviço para comunicação, seja ele
 * websocket ou outro.
 * Author: Tiago Felipe <tiago@tiagofelipe.com>
 * +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=
 * Atualmente, esta aplicação depende de uma conexão websocket
 */

const actions = {
  lance: (data) => {

  }
};

const Comunicator = (function () {

  const Comunication = function (uri, config) {

    /**
     * Holds the uri to connect to
     * @type {String}
     * @private
     */
    this._uri = uri;

    /**
     * Hold autobahn session reference
     * @type {String|Array|Object}
     * @private
     */
    this._session = false;

    /**
     * Hold event callbacks
     * @type {Object}
     * @private
     */
    this._listeners = {};

    //calls the  Comunication connect function.
    this.connect();
  };

  Comunication.prototype.connect = function () {

    console.log(`Connecting to ${this._uri}`)

    /*ab.connect(this._uri,

      //Function on connect
      function (session) {
        this.fire({type: "socket/connect", data: session});
      },

      //Function on disconnect / error
      function (code, reason) {
        this._session = false;

        this.fire({type: "socket/disconnect", data: {code: code, reason: reason}});
      }
    );*/
  };

  /**
   * Adds a listener for an event type
   *
   * @param {String} type
   * @param {function} listener
   */
  Comunication.prototype.on = function (type, listener) {
    // Check if listener is valid on actions list
    if (typeof actions[type] === 'undefined') {
      throw new Error(`Event '${type}' is invalid. No action exists.`);
    }
    if (typeof this._listeners[type] === "undefined") {
      this._listeners[type] = [];
    }

    this._listeners[type].push(listener);
  };

  /**
   * Fires an event for all listeners.
   * @param {String} event
   */
  Comunication.prototype.fire = function (event) {
    if (typeof event === "string") {
      event = {type: event};
    }
    if (!event.target) {
      event.target = this;
    }

    if (!event.type) {  //falsy
      throw new Error("Event object missing 'type' property.");
    }

    if (this._listeners[event.type] instanceof Array) {
      let listeners = this._listeners[event.type];
      for (let i = 0, len = listeners.length; i < len; i++) {
        listeners[i].call(this, event.data);
      }
    }
  };

  /**
   * Removes a listener from an event
   *
   * @param {String} type
   * @param {function} listener
   */
  Comunication.prototype.off = function (type, listener) {
    if (this._listeners[type] instanceof Array) {
      let listeners = this._listeners[type];
      for (let i = 0, len = listeners.length; i < len; i++) {
        if (listeners[i] === listener) {
          listeners.splice(i, 1);
          break;
        }
      }
    }
  };

  return {
    connect: function (uri) {
      return new Comunication(uri);
    }
  }

})();

module.exports = Comunicator;