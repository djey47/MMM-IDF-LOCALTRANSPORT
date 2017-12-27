const { generateCallInfo } = require('../utils');

module.exports = {
  path: '/legacy/schedules/tramways/*',
  method: 'GET',
  template: {
    result: {
      'schedules': [
        {
          'message': '7 mn',
          'destination': 'Porte de Versailles',
        },
        {
          'message': '11 mn',
          'destination': 'Porte de Versailles',
        },
      ], 
    },
    _metadata: {
      call: (q) => generateCallInfo('schedules/tramways', q),
      date: '2017-12-19T16:02:54+01:00',
      version: 3,
    },  
  },
};


