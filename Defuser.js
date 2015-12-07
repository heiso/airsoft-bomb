var five = require('johnny-five');
var Config = require('./Config.js');
var Miscs = require('./Utils/Miscs.js');
var eventService = require('./Services/eventService.js');

function Defuser() {
  this.potentiometer = {
    'potentiometer': new five.Sensor({
      'pin': Config.defuser.inputs.potentiometerPin
    }),
    'currentPos': null,
    'lastPos': null,
    'diffPos': null
  };
  this.indicator = {
    'led': new five.Led(Config.defuser.outputs.indicatorLedPin),
    'idle': 0,
    'speed': Config.tickSpeed
  };
  this.unlocked = new five.Leds(Config.defuser.outputs.unlockedLedPins);
  this.buzzer = new five.Piezo(Config.defuser.outputs.buzzerPin);

  this.secret = generateSecrete();
  this.currentSecretIndex = 0;
  this.idle = {
    'time': 0,
    'pause': true
  };
  this.running = false;

  this.buzzer.off();
  eventService.broadcast('defuser.log', this.secret);
}

Defuser.prototype.processPos = function processPos() {
  this.potentiometer.lastPos = this.potentiometer.currentPos;
  this.potentiometer.currentPos = Math.round(this.potentiometer.potentiometer.value);
  if (this.potentiometer.lastPos === null) {
    this.potentiometer.lastPos = this.potentiometer.currentPos;
  }
  this.potentiometer.diffPos = Math.abs(this.secret[this.currentSecretIndex] - Miscs.scaleAnalog(this.potentiometer.currentPos, 0, Config.defuser.potentiometer.maxPos));
  eventService.broadcast('defuser.log', this.potentiometer.potentiometer.value, this.potentiometer.diffPos, this.idle.time);
};

Defuser.prototype.processIdle = function processIdle() {
  if (!this.idle.pause) {
    if (Math.abs(this.potentiometer.currentPos - this.potentiometer.lastPos) > Config.defuser.potentiometer.analogTreshold) {
      this.idle.time = 0;
    } else {
      this.idle.time = this.idle.time + Config.tickSpeed;
    }
  } else if (Math.abs(this.potentiometer.currentPos - this.potentiometer.lastPos) > Config.defuser.potentiometer.analogTreshold) {
    this.idle.pause = false;
  }
};

Defuser.prototype.processIndicator = function processIndicator() {
  if (!this.idle.pause) {
    this.indicator.speed = this.potentiometer.diffPos*Config.tickSpeed + Config.tickSpeed;

    this.indicator.idle = this.indicator.idle + Config.tickSpeed;
    if (this.potentiometer.diffPos === 0) {
      this.indicator.led.on();
    } else if (this.indicator.idle >= this.indicator.speed) {
      this.indicator.idle = 0;
      if (this.indicator.led.value) {
        this.indicator.led.off();
      } else {
        this.indicator.led.on();
      }
    }
  } else {
    this.indicator.led.off();
  }
};

Defuser.prototype.processUnlocked = function processUnlocked() {
  if (this.idle.time >= Config.defuser.potentiometer.maxIdleAllowed) {
    if (this.potentiometer.diffPos !== 0) {
      this.unlocked.off();
      this.buzzer.frequency(262, 1000);
      setTimeout(function() {
        this.buzzer.off();
      }.bind(this), 500);
      this.start();
    } else {
      this.unlocked.leds[this.currentSecretIndex].on();
      this.next();
    }
  }
};

Defuser.prototype.next = function next() {
  this.currentSecretIndex++;
  this.idle.time = 0;
  this.idle.pause = true;
  if (this.currentSecretIndex > this.secret.length - 1) {
    this.stop();
  }
  eventService.broadcast('defuser.next');
};

Defuser.prototype.stop = function stop() {
  this.running = false;
  this.indicator.led.off();
  eventService.broadcast('defuser.stop');
};

Defuser.prototype.start = function start() {
  this.running = true;
  this.currentSecretIndex = 0;
  this.idle.time = 0;
  this.potentiometer.currentPos = null;
  this.potentiometer.lastPos = null;
  this.potentiometer.diffPos = null;
  this.idle.pause = true;
  eventService.broadcast('defuser.start');
};

Defuser.prototype.process = function process() {
  if (this.running) {
    this.processPos();
    this.processIdle();
    this.processIndicator();
    this.processUnlocked();
  }
};

Defuser.prototype.init = function init() {
  var waitForInit = setInterval(function() {
    if (this.potentiometer.potentiometer.value !== null) {
      clearInterval(waitForInit);
      this.start();
    }
  }.bind(this), Config.tickSpeed);
};

function generateSecrete() {
  var min = 0;
  var rtn = [];
  while(rtn.length < Config.defuser.outputs.unlockedLedPins.length) {
    rtn.push(Math.floor(Math.random() * (Config.defuser.potentiometer.maxPos - min + 1) + min));
  }
  return rtn;
}

module.exports = Defuser;
