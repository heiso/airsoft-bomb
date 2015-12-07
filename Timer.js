var moment = require('moment');
var five = require('johnny-five');
var Config = require('./Config.js');
var Miscs = require('./Utils/Miscs.js');
var eventService = require('./Services/eventService.js');

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
  eventService.broadcast('timer.end');
};

Timer.prototype.start = function start() {
  this.running = true;
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
