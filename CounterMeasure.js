var pixel = require("node-pixel");
var five = require('johnny-five');
var Config = require('./Config.js');
var Miscs = require('./Utils/Miscs.js');
var eventService = require('./Services/eventService.js');
var board = require('./Services/boardService.js');

function CounterMeasure() {
  this.running = false;
  this.accelerometer = {
    'x': null,
    'y': null,
    'z': null,
    'lastX': null,
    'lastY': null,
    'lastZ': null,
    'lvl': 0
  };
  this.indicator = {
    'leds': new pixel.Strip({
      'data': Config.counterMeasure.outputs.ledsPin,
      'length': Config.counterMeasure.outputs.ledsNbr,
      'board': board,
      'controller': 'FIRMATA',
    }),
    'current': 0,
    'last': 0,
    'lastUpdate': 0
  };
}

CounterMeasure.prototype.processAccelerometer = function processAccelerometer() {
  board.io.i2cReadOnce(0x1D, 0x01, 6, function(data) {
    this.accelerometer = {
      'lastX': this.accelerometer.x,
      'lastY': this.accelerometer.y,
      'lastZ': this.accelerometer.z,
      'x': data[0],
      'y': data[2],
      'z': data[4]
    };
    this.accelerometer.lvl = calculateLvl(this.accelerometer);
  }.bind(this));
};

CounterMeasure.prototype.processIndicator = function processIndicator() {
  if (this.indicator.current < this.accelerometer.lvl || (this.indicator.current > this.accelerometer.lvl && this.indicator.lastUpdate + 250 < Date.now())) {
    this.indicator.current = this.accelerometer.lvl;
    this.indicator.lastUpdate = Date.now();
  }
  for (var i = 0; i < Config.counterMeasure.outputs.ledsNbr-1; i++) {
    if (i < this.indicator.current) {
      this.indicator.leds.pixel(i).color('#ff0000');
    } else {
      this.indicator.leds.pixel(i).color('#000000');
    }
  }
  this.indicator.leds.show();
  console.log(this.accelerometer.lvl);
};

CounterMeasure.prototype.explode = function explode() {
  eventService.broadcast('counterMeasure.explode');
};

CounterMeasure.prototype.stop = function end() {
  this.running = false;
  eventService.broadcast('counterMeasure.stop');
};

CounterMeasure.prototype.start = function start() {
  this.running = true;
  this.indicator.leds.color('#000000');
  this.indicator.leds.show();
  eventService.broadcast('counterMeasure.start');
};

CounterMeasure.prototype.process = function process() {
  if (this.running) {
    this.processAccelerometer();
    this.processIndicator();
  }
};

CounterMeasure.prototype.init = function init() {
  var accelerometerReady = false;
  var ledsReady = false;

  board.io.i2cConfig();

  board.io.i2cWriteReg(0x1D, 0x2B, 0x02);
  board.io.i2cWriteReg(0x1D, 0x2A, 0x04);
  board.io.i2cWriteReg(0x1D, 0x2D, 0x01);
  board.io.i2cWriteReg(0x1D, 0x2E, 0x01);
  board.io.i2cWriteReg(0x1D, 0x11, 0x40);
  board.io.i2cWriteReg(0x1D, 0x2A, 0x01);

  board.io.i2cReadOnce(0x1D, 0x01, 6, function(data) {
    if (data[0] !== null && data.length === 6) {
      accelerometerReady = true;
    }
  }.bind(this));
  this.indicator.leds.on('ready', function() {
    ledsReady = true;
  });

  var waitForInit = setInterval(function() {
    if (accelerometerReady && ledsReady) {
      clearInterval(waitForInit);
      this.start();
    }
  }.bind(this), Config.tickSpeed);
};

function calculateLvl(data) {
  var diffX = Math.abs(data.lastX - data.x);
  var diffY = Math.abs(data.lastY - data.y);
  var diffZ = Math.abs(data.lastZ - data.z);
  var average = Math.ceil((diffX + diffY + diffZ) / 3);
  return Miscs.scale(average, 0, 255, 0, Config.counterMeasure.outputs.ledsNbr);
}

module.exports = CounterMeasure;
