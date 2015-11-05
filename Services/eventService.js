var Uuid = require('../Utils/Uuid.js');

var listeners = {};

function broadcast(event, value) {
  if (listeners[event] !== undefined) {
    for (var i = 0; i < listeners[event].length; i++) {
      listeners[event][i].call(this, value);
    }
  }
}

function on(event, fct) {
  if (listeners[event] === undefined) {
    listeners[event] = [];
  }
  listeners[event].push(fct);
}

module.exports = {
  'broadcast': broadcast,
  'on': on
};
