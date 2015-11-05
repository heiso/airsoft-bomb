var five = require('johnny-five');
var Config = require('./Config.js');
var Defuser = require('./Defuser.js');

var board = new five.Board();

board.on('ready', function() {
  var defuser = new Defuser();
  defuser.init();

  var tick = setInterval(function() {
    defuser.process();
  }, Config.tickSpeed);

});
