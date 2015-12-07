var pixel = require("node-pixel");
var five = require('johnny-five');
var Config = require('./Config.js');
var Miscs = require('./Utils/Miscs.js');
var eventService = require('./Services/eventService.js');
var board = require('./Services/boardService.js');

function CounterMeasure() {
  this.running = false;
  this.lvlHistoryTime = [];
  this.lvlHistory = [];
  this.lvlComputed = 0;
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

CounterMeasure.prototype.processLevel = function processLevel() {
  var now = Date.now();

  for (var i = this.lvlHistoryTime.length-1; i >= 0; i--) {
    if (this.lvlHistoryTime[i] + Config.counterMeasure.historyTtl < now) {
      this.lvlHistory.splice(0, i + 1);
      this.lvlHistoryTime.splice(0, i + 1);
    }
  }

  if (this.accelerometer.lvl > 2 && this.lvlComputed < Config.counterMeasure.outputs.ledsNbr) {
    this.lvlComputed = this.accelerometer.lvl;
    this.lvlHistory.push(this.accelerometer.lvl);
    this.lvlHistoryTime.push(now);
  } else if (this.lvlComputed > 0) {
    this.lvlComputed = this.lvlComputed - 1;
  }

  if (this.lvlHistory.length > 0) {
    // ajouter un check des valeurs voisines, pour elmiminer les faux positif
    // si les velaures voisines sont proche de la valeur max -> on garde
    //
    //
    // average peut etre une bonne idée, mais a combiner avec un ajout de +1 à chaque mouvement au dessus de par exemple 4 ou 5
    //
    //
    //
    //
    this.lvlComputed = Math.round(this.lvlHistory.reduce(function(sum, a) {return sum + Number(a);}, 0)/this.lvlHistory.length);
    //Math.max.apply(this, this.lvlHistory) +
  }

  // console.log(this.accelerometer.lvl, this.lvlComputed, this.lvlHistory);
};

CounterMeasure.prototype.processIndicator = function processIndicator() {
  this.indicator.current = this.lvlComputed;
  for (var i = 0; i < Config.counterMeasure.outputs.ledsNbr; i++) {
    if (i < this.indicator.current) {
      this.indicator.leds.pixel(i).color('#ff0000');
    } else {
      this.indicator.leds.pixel(i).color('#000000');
    }
  }
  this.indicator.leds.show();
};

CounterMeasure.prototype.explode = function explode() {
  eventService.broadcast('counterMeasure.explode');
};

CounterMeasure.prototype.stop = function stop() {
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
    this.processLevel();
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
  // 190 - 255 ---- 0 - 65 -> max interval = 65
  var diffX = isInSameInterval(data.lastX, data.x) ? Math.abs(data.lastX - data.x) : 0;
  var diffY = isInSameInterval(data.lastY, data.y) ? Math.abs(data.lastY - data.y) : 0;
  var diffZ = isInSameInterval(data.lastZ, data.z) ? Math.abs(data.lastZ - data.z) : 0;
  var value = Math.max(diffX, diffY, diffZ);
  return Miscs.scale(value, 0, 65, 0, Config.counterMeasure.outputs.ledsNbr);
}

function isInSameInterval(a, b) {
  return Math.abs(a - b) <= 65;
}

module.exports = CounterMeasure;
