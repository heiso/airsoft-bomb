module.exports = {
  'tickSpeed': 25,

  'counterMeasure': {
    'historyTtl': 1000,
    'inputs': {

    },
    'outputs': {
      'ledsPin': 8,
      'ledsNbr': 8
    }
  },
  'defuser': {
    'inputs' : {
      'potentiometerPin': 'A0'
    },
    'outputs' : {
      'indicatorLedPin': 7,
      'unlockedLedPins': [3, 4, 5, 6],
      'buzzerPin': 8
    },
    'potentiometer': {
      'maxPos': 20,
      'analogTreshold': 2,
      'maxIdleAllowed': 2000
    }
  }
};
