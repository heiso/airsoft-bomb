global.__base = __dirname + '/';

var five = require('johnny-five');
var board = require(__base + 'Services/boardService.js');

var Config = require(__base + 'Config.js');
var eventService = require(__base + 'Services/eventService.js');

var Activator = require(__base + 'Modules/Activator/Activator.js');
var CounterMeasure = require(__base + 'Modules/CounterMeasure/CounterMeasure.js');
var Defuser = require(__base + 'Modules/Defuser/Defuser.js');
var Detonator = require(__base + 'Modules/Detonator/Detonator.js');
var Timer = require(__base + 'Modules/Timer/Timer.js');

board.on('ready', function() {

  var activator = new Activator();
  var counterMeasure = new CounterMeasure();
  var defuser = new Defuser();
  var detonator = new Detonator();
  var timer = new Timer();

  function init() {
    initEvents();

    activator.init();
    counterMeasure.init();
    detonator.init();
    timer.init();
    
    defuser.init();
  }

  function initEvents() {
    eventService.on('defuser.stop', function() {
      console.log('Defused');
    });

    // eventService.on('counterMeasure.stop', function() {
    //   defuser.init();
    // });
  }

  var tick = setInterval(function() {
    // activator.process();
    // counterMeasure.process();
    defuser.process();
    // detonator.process();
    // timer.process();
  }, Config.tickSpeed);

});
