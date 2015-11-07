var five = require('johnny-five');
var board = require('./Services/boardService.js');
var Config = require('./Config.js');
var eventService = require('./Services/eventService.js');
var Defuser = require('./Defuser.js');
var CounterMeasure = require('./CounterMeasure.js');

board.on('ready', function() {

  var defuser = new Defuser();
  var counterMeasure = new CounterMeasure();
  counterMeasure.init();

  eventService.on('defuser.stop', function() {
    console.log('Defused');
  });

  eventService.on('counterMeasure.stop', function() {
    defuser.init();
  });

  var tick = setInterval(function() {
    defuser.process();
    counterMeasure.process();
  }, Config.tickSpeed);

});
