var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Comunicador v1.0.0
 * Responsável pela comunicação realtime entre os sistemas de leilão
 * Esta biblioteca deve prover uma transparência entre a aplicação e o tipo de serviço para comunicação, seja ele
 * websocket ou outro.
 * Author: Tiago Felipe <tiago@tiagofelipe.com>
 * +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=
 * Atualmente, esta aplicação depende de uma conexão websocket
 */

var actions = {

  /**
   * Quando o sistema recebe um novo lance em um lote. Pode ser da plateia ou de um arrematante online.
   * @param data
   * @return {Object|null}
   * Sample:
   * {
   *  leilao: {Integer}
   *  lote: {
   *    id: {Integer}
   *    lance: {
   *      id: {Integer}
   *      data: {Datetime}
   *      valor: {Decimal}
   *      arrematante: {
   *        id: {Integer}
   *        apelido: {String} (e.g.: TIAGOFELIPE)
   *        pessoa: {
   *          id: {Integer}
   *          essencial: {
   *            cidade: {String}
   *            uf: {String}
   *          }
   *        }
   *      }
   *    }
   *  }
   * }
   */
  lance: function lance(data) {
    return data;
  },

  /**
   * Quando o status de um lote é alterado.
   * @param data
   * @return {Object|null}
   * Sample:
   * {
   *  leilao: {Integer}
   *  lote: {
   *    id: {Integer}
   *    status: {Integer}
   *  }
   * }
   */
  status: function status(data) {
    return data;
  },

  /**
   * Quando o status de um leilão é alterado.
   * @param data
   * @return {Object|null}
   * Sample:
   * {
   *  leilao: {Integer}
   *  status: {Integer}
   * }
   */
  statusLeilao: function statusLeilao(data) {
    return data;
  },

  /**
   * Quando o controlador renova o tempo.
   * @param data
   * @return {Object|null}
   * Sample:
   * {
   *  leilao: {Integer}
   *  lote: {
   *    id: {Integer}
   *    status: {Integer}
   *    tempo: {Integer}
   *  }
   * }
   */
  tempo: function tempo(data) {
    return data;
  },

  /**
   * Quando o pregão muda de lote.
   * @param data
   * @return {Object|null}
   * Sample:
   * {
   *  leilao: {Integer}
   *  lote: {Object}
   *  pregao: {Object}
   * }
   */
  mudaLote: function mudaLote(data) {
    return data;
  },

  /**
   * Quando o controlador deleta um lance.
   * @param data
   * @return {Object|null}
   * Sample:
   * {
   *  leilao: {Integer}
   *  lote: {
   *    id: {Integer}
   *    lance: {Integer}
   *  }
   * }
   */
  lanceDeletado: function lanceDeletado(data) {
    return data;
  },

  /**
   * Quando o incremento mínimo do lote é alterado.
   * @param data
   * @return {Object|null}
   * Sample:
   * {
   *  leilao: {Integer}
   *  lote: {
   *    id: {Integer}
   *    incremento: {Float}
   *  }
   * }
   */
  alteracaoIncremento: function alteracaoIncremento(data) {
    return data;
  },

  /**
   * Quando o tempo do pregão do leilão é alterado.
   * @param data
   * @return {Object|null}
   * Sample:
   * {
   *  leilao: {Integer}
   *  tempo: {Integer}
   * }
   */
  alteracaoTempo: function alteracaoTempo(data) {
    return data;
  },

  /**
   * Quando um comitente toma uma decisão de aprovar, rejeitar ou condicionar um lance em um determinado lote.
   * @param data
   * @return {Object|null}
   * Sample:
   * {
   *  leilao: {Integer}
   *  lote: {
   *    id: {Integer}
   *    status: {Integer}
   *  }
   */
  comitenteDecisaoStatusLote: function comitenteDecisaoStatusLote(data) {
    return data;
  }

};

var Comunicator = function () {

  var Comunication = function Comunication(uri, config, ComunicatorInterface) {
    var _this = this;

    /**
     * Holds the uri to connect to
     * @type {String}
     * @private
     */
    this._uri = uri;

    /**
     * If Comunicator driver is connected
     * @type {String|Array|Object}
     * @private
     */
    this._isConnected = false;

    /**
     * Inform if client has support to Comunicator techonology
     * @type boolean
     */
    this._hasSupport = false;

    /**
     * Attemps to reconnect case connection lost
     * @type int
     */
    this._attempts = 0;
    this._maxAttempts = null;
    this._intervalAttempts = null;
    this._closedByUser = false;

    /**
     * Session instance of connection
     * @type object|null
     */
    this._session = null;

    /**
     * Reliable events
     * @type int
     */
    this._events = ["com/connect", "com/disconnect", "com/error"];

    /**
     * Class for Comunication provider
     */
    if (typeof ComunicatorInterface !== 'undefined') {
      this._comunicator = ComunicatorInterface;
      this._hasSupport = true;
    } else {
      if (window.WebSocket) {
        this._comunicator = WebSocket;
        this._hasSupport = true;
      }
    }
    /**
     * Hold event callbacks
     * @type {Object}
     * @private
     */
    this._listeners = {};

    this.on('com/connect', function (env) {
      clearInterval(_this._intervalAttempts);
      console.log('Comunicator connection re-establish');
    });
    this.on('com/disconnect', function (env) {
      if (_this._closedByUser) {
        console.log('Closed by user. No need to reconnect');
        return;
      }
      // let hasLimit = _maxAttempts !== null
      clearInterval(_this._intervalAttempts);
      _this._intervalAttempts = setInterval(function () {

        if (_this._maxAttempts === null) {
          console.log('Comunicator connection lost, attempt to reconnect: ' + _this._attempts + ' attempt');
        } else {
          console.log('Comunicator connection lost, attempt to reconnect: ' + _this._attempts + ' of ' + _this._maxAttempts);
        }

        _this._attempts = _this._attempts + 1;
        _this.connect();
      }, 10000); // 10 seconds
    });

    //calls the Comunication connect function.
    this.connect();
  };

  Comunication.prototype.hasSupport = function () {
    return this._hasSupport;
  };

  Comunication.prototype.connect = function () {
    var _this2 = this;

    if (!this._hasSupport) {
      //throw new Error('Browser no support realtime comunication provider');
      console.log('Browser no support realtime comunication provider');
      return;
    }

    console.log("Connecting to " + this._uri);

    var com = void 0;
    try {
      com = new this._comunicator(this._uri);
    } catch (e) {
      console.log(e.message);
      this.fire({ type: 'com/disconnect', data: { code: 0, reason: e.message } });
      return;
    }

    this._session = com;

    com.onopen = function (env) {
      _this2.fire({ type: 'com/connect', data: env });
      _this2._isConnected = true;
    };
    com.onclose = function (env) {
      _this2.fire({ type: 'com/disconnect', data: env });
      _this2._isConnected = false;
    };
    com.onmessage = function (data) {
      return _this2.parseMessage(data);
    };
    com.onerror = function (env) {
      return _this2.fire({ type: 'com/error', data: env });
    };
  };

  /**
   * Close connection
   */
  Comunication.prototype.close = function () {
    this._closedByUser = true;
    this._session.close();
    this._session = null;
  };

  /**
   * Check if driver is connected
   *
   * @return boolean
   */
  Comunication.prototype.isConnected = function () {
    return this._isConnected;
  };

  /**
   * Adds a listener for an event type
   *
   * @param {String} type
   * @param {function} listener
   */
  Comunication.prototype.on = function (type, listener) {
    // Check if listener is valid on actions list
    if (typeof actions[type] === 'undefined' && _typeof(this._events.indexOf(type)) === -1) {
      throw new Error("Event '" + type + "' is invalid. No action exists.");
    }
    if (typeof this._listeners[type] === 'undefined') {
      this._listeners[type] = [];
    }

    this._listeners[type].push(listener);
  };

  /**
   * Fires an event for all listeners.
   * @param {String} event
   */
  Comunication.prototype.fire = function (event) {
    if (typeof event === 'string') {
      event = { type: event };
    }
    if (!event.target) {
      event.target = this;
    }

    console.log('Fire event ' + event.type + ' whith data: ', event.data);

    if (!event.type) {
      throw new Error('Event object missing *type* property.');
    }

    if (this._listeners[event.type] instanceof Array) {
      var listeners = this._listeners[event.type];
      for (var i = 0, len = listeners.length; i < len; i++) {
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
      var listeners = this._listeners[type];
      for (var i = 0, len = listeners.length; i < len; i++) {
        if (listeners[i] === listener) {
          listeners.splice(i, 1);
          break;
        }
      }
    }
  };

  /**
   * Parse an message and process event, if valid
   *
   * @param Mixed data
   */
  Comunication.prototype.parseMessage = function (_event) {
    console.log('Message received: ', _event);
    if (typeof _event['data'] === 'undefined') {
      console.log('Event without data');
      return;
    }

    var event = void 0;
    try {
      event = JSON.parse(_event.data);
    } catch (e) {
      console.log('Invalid message, ignoring comunication. Reason: Message must be a valid JSON');
      return;
    }

    if (typeof event['type'] === 'undefined') {
      console.log('Invalid event, propert *type* is not defined');
      return;
    }

    // Verify if is an valid event
    if (typeof actions[event.type] === 'undefined') {
      console.log("Event *" + event.type + "* not found");
      return;
    }

    if (typeof event['data'] === 'undefined') {
      console.log('Event without data');
      return;
    }

    this.fire({ type: event.type, data: actions[event.type](event.data) });
  };

  return {
    connect: function connect(uri, config, driver) {
      return new Comunication(uri, config, driver);
    }
  };
}();

if (typeof module !== 'undefined') {
  module.exports = Comunicator;
}