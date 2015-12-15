var five = require('johnny-five');
var board = require('./Services/boardService.js');
var Config = require('./Config.js');
var eventService = require('./Services/eventService.js');
var Defuser = require('./Defuser.js');
var CounterMeasure = require('./CounterMeasure.js');
var Timer = require('./Timer.js');

board.on('ready', function() {

  var defuser = new Defuser();
  var counterMeasure = new CounterMeasure();
  var timer = new Timer();
  counterMeasure.init();
  timer.init(2000);
  timer.start();

  eventService.on('defuser.stop', function() {
    console.log('Defused');
  });

  eventService.on('counterMeasure.stop', function() {
    defuser.init();
  });

  board.io.i2cConfig();
  board.io.i2cWriteReg(0x20, 0x00, 0x00);
  board.io.i2cWriteReg(0x20, 0x01, 0x00);
  board.io.i2cWriteReg(0x20, 0x12, 0xFF);
  board.io.i2cWriteReg(0x20, 0x13, 0xFF);
  var tick = setInterval(function() {
    // defuser.process();
    // counterMeasure.process();
    // timer.process();
  }, Config.tickSpeed);

});
