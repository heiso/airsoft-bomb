function Leds(leds) {
  this.leds = leds;
}

Leds.prototype.offAll = function offAll() {
  for (var i = 0; i < this.leds.length; i++) {
    this.leds[i].off();
  }
};

module.exports = Leds;
