var Config = require(__base + 'Config.js');

function Miscs() {

}

Miscs.scaleAnalog = function scaleAnalog(value, min, max) {
  return this.scale(value, 0, 1024, min, max);
};

Miscs.scale = function scale(value, minValue, maxValue, min, max) {
  var percent = (value - minValue) / (maxValue - minValue);

  return Math.round(percent * (max - min) + min);
};


module.exports = Miscs;
