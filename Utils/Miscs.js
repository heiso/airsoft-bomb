var Config = require('../Config.js');

function Miscs() {

}

Miscs.scaleAnalog = function scaleAnalog(value, min, max) {
  var AMin = 0;
  var AMax = 1024;
  var percent = (value - AMin) / (AMax - AMin);

  return Math.round(percent * (max - min) + min);
};

module.exports = Miscs;
