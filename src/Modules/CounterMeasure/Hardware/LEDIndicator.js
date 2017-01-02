var five = require('johnny-five');
var board = require(__base + 'Services/boardService.js');
var pixel = require('node-pixel');

var Config = require(__base + 'Config.js');
var Miscs = require(__base + 'Utils/Miscs.js');
var eventService = require(__base + 'Services/eventService.js');

var counterMeasureConfig = require(__base + 'Modules/LEDIndicator/counterMeasureConfig.js');

function LEDIndicator() {

}

LEDIndicator.prototype.processLevel = function processLevel() {
  var now = Date.now();

  for (var i = this.lvlHistoryTime.length-1; i >= 0; i--) {
    if (this.lvlHistoryTime[i] + counterMeasureConfig.historyTtl < now) {
      this.lvlHistory.splice(0, i + 1);
      this.lvlHistoryTime.splice(0, i + 1);
    }
  }

  if (this.accelerometer.lvl > 2 && this.lvlComputed < counterMeasureConfig.outputs.ledsNbr) {
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

LEDIndicator.prototype.start = function start() {
  this.running = true;
  this.indicator.leds.color('#000000');
  this.indicator.leds.show();
  eventService.broadcast('counterMeasure.start');
};

LEDIndicator.prototype.process = function process() {
  this.indicator.current = this.lvlComputed;
  for (var i = 0; i < counterMeasureConfig.outputs.ledsNbr; i++) {
    if (i < this.indicator.current) {
      this.indicator.leds.pixel(i).color('#ff0000');
    } else {
      this.indicator.leds.pixel(i).color('#000000');
    }
  }
  this.indicator.leds.show();
};

LEDIndicator.prototype.isReady = function isReady() {
  var ledsReady = false;
  this.indicator.leds.on('ready', function() {
    ledsReady = true;
  });
  return ledsReady;
};

function calculateLvl(data) {
  // 190 - 255 ---- 0 - 65 -> max interval = 65
  var diffX = isInSameInterval(data.lastX, data.x) ? Math.abs(data.lastX - data.x) : 0;
  var diffY = isInSameInterval(data.lastY, data.y) ? Math.abs(data.lastY - data.y) : 0;
  var diffZ = isInSameInterval(data.lastZ, data.z) ? Math.abs(data.lastZ - data.z) : 0;
  var value = Math.max(diffX, diffY, diffZ);
  return Miscs.scale(value, 0, 65, 0, counterMeasureConfig.outputs.ledsNbr);
}

function isInSameInterval(a, b) {
  return Math.abs(a - b) <= 65;
}

module.exports = LEDIndicator;
