var five = require('johnny-five');
var board = require(__base + 'Services/boardService.js');

var Config = require(__base + 'Config.js');
var Miscs = require(__base + 'Utils/Miscs.js');
var eventService = require(__base + 'Services/eventService.js');

var detonatorConfig = require(__base + 'Modules/Detonator/detonatorConfig.js');

function Detonator() {
  this.running = false;
}

Detonator.prototype.stop = function stop() {
  this.running = false;
  eventService.broadcast('detonator.stop');
};

Detonator.prototype.start = function start() {
  this.running = true;
  eventService.broadcast('detonator.start');
};

Detonator.prototype.process = function process() {
  if (this.running) {
    // process
  }
};

Detonator.prototype.init = function init() {
  var waitForInit = setInterval(function() {
    if (true) { // condition to start
      clearInterval(waitForInit);
      this.start();
    }
  }.bind(this), Config.tickSpeed);
};

module.exports = Detonator;
