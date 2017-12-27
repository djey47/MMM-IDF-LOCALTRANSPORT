const moment = require('moment-timezone');
const { addMinutesAndFormat, generateCallInfo } = require('../utils');

const getSchedules = () => {
  return [
    {
      'code': 'KALI',
      'message': 'Train à quai',
      'destination': 'Massy-Palaiseau',
    },
    {
      'code': 'SOSO',
      'message': addMinutesAndFormat(moment(), 10),
      'destination': 'Robinson',
    },
    {
      'code': 'PINA',
      'message': addMinutesAndFormat(moment(), 2),
      'destination': 'Saint-Remy-les-Chevreuse',
    },
    {
      'code': 'KANE',
      'message': addMinutesAndFormat(moment(), 3),
      'destination': 'Massy-Palaiseau',
    },
    {
      'code': 'SOME',
      'message': addMinutesAndFormat(moment(), 6),
      'destination': 'Robinson',
    },
    {
      'code': 'PINA',
      'message': addMinutesAndFormat(moment(), 4),
      'destination': 'Saint-Remy-les-Chevreuse',
    },
  ];
};

module.exports = {
  path: '/legacy/schedules/rers/*',
  method: 'GET',
  template: {
    result: {
      schedules: () => getSchedules(),
    },
    _metadata: {
      call: (q) => generateCallInfo('schedules/rers', q),
      date: '2017-12-19T16:02:54+01:00',
      version: 3,
    },  
  },
};
