var five = require('johnny-five');
var Config = require('./Config.js');
var eventService = require('./Services/eventService.js');
var Defuser = require('./Defuser.js');

var board = new five.Board();

board.on('ready', function() {
  var defuser = new Defuser();
  defuser.init();

  eventService.on('defuser.stop', function() {
    console.log('Defused');
  });

  var tick = setInterval(function() {
    defuser.process();
  }, Config.tickSpeed);

});
