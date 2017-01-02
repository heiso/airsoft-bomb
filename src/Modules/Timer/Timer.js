var five = require('johnny-five');
var moment = require('moment');

var Config = require(__base + 'Config.js');
var Miscs = require(__base + 'Utils/Miscs.js');
var eventService = require(__base + 'Services/eventService.js');

var timerConfig = require(__base + 'Modules/Timer/timerConfig.js');

function Timer() {
  this.displayDigit = new five.Led.Digits({
    controller: 'HT16K33'
  });
  this.countdown = 0; //ms
  this.elapsedTime = 0; //ms
}

Timer.prototype.processTimer = function processTimer() {
  this.elapsedTime = this.elapsedTime + Config.tickSpeed;
  if (this.elapsedTime) {
    var time = moment(this.elapsedTime).format('mm:ss');
    this.displayDigit.print(time);
    console.log(time);
  }
  // if (this.countdown <= this.elapsedTime) {
  //   this.stop();
  // }
};

Timer.prototype.setCountdown = function setCountdown(time) {
  this.countdown = time;
};






Timer.prototype.stop = function stop() {
  this.running = false;
  eventService.broadcast('timer.stop');
};

Timer.prototype.start = function start() {
  this.running = true;
  eventService.broadcast('timer.start');
};

Timer.prototype.process = function process() {
  if (this.running) {
    this.processTimer();
  }
};

Timer.prototype.init = function init(time) {
  this.countdown = 0;
  this.elapsedTime = 0;
  this.setCountdown(time);
};

module.exports = Timer;
