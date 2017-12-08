const { generateCallInfo } = require('../utils');

module.exports = {
  path: '/legacy/schedules/metros/*',
  method: 'GET',
  template: {
    result: {
      'schedules': [
        {
          'message': "Train a l'approche",
          'destination': 'Pont de Levallois-Becon',
        },
        {
          'message': '1 mn',
          'destination': 'Pont de Levallois-Becon',
        },
        {
          'message': '3 mn',
          'destination': 'Pont de Levallois-Becon',
        },
        {
          'message': '5 mn',
          'destination': 'Pont de Levallois-Becon',
        },
      ], 
    },
    _metadata: {
      call: (q) => generateCallInfo('schedules/metros', q),
      date: '2017-12-19T16:02:54+01:00',
      version: 3,
    },  
  },
};

