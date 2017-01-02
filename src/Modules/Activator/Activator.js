var five = require('johnny-five');
var board = require(__base + 'Services/boardService.js');

var Config = require(__base + 'Config.js');
var Miscs = require(__base + 'Utils/Miscs.js');
var eventService = require(__base + 'Services/eventService.js');

var activatorConfig = require(__base + 'Modules/Activator/activatorConfig.js');

function Activator() {
  this.running = false;
}

Activator.prototype.stop = function stop() {
  this.running = false;
  eventService.broadcast('activator.stop');
};

Activator.prototype.start = function start() {
  this.running = true;
  eventService.broadcast('activator.start');
};

Activator.prototype.process = function process() {
  if (this.running) {
    // process
  }
};

Activator.prototype.init = function init() {
  var waitForInit = setInterval(function() {
    if (true) { // condition to start
      clearInterval(waitForInit);
      this.start();
    }
  }.bind(this), Config.tickSpeed);
};

module.exports = Activator;
