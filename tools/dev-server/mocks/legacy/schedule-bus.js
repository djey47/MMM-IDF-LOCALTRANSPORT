const { generateCallInfo } = require('../utils');

module.exports = {
  path: '/legacy/schedules/bus/*',
  method: 'GET',
  template: {
    result: {
      'schedules': [
        {
          'message': '5 mn',
          'destination': 'Pont de Levallois-Metro',
        },
        {
          'message': '15 mn',
          'destination': 'Pont de Levallois-Metro',
        },
      ], 
    },
    _metadata: {
      call: (q) => generateCallInfo('schedules/bus', q),
      date: '2017-12-19T16:02:54+01:00',
      version: 3,
    },  
  },
};
