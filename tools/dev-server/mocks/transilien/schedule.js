const moment = require('moment');
const { addMinutesAndFormatWithDate } = require('../utils');

const getTrain = () => {
  const now = moment();
  return [
    {
      date:{
        '$':{ mode:'R' },
        _: addMinutesAndFormatWithDate(now, 10),
      },
      etat:'Retardé',
      miss:'POPI',
      num:'135140',
      term:'87384008',
    },
    {
      date:{
        '$':{ mode:'R' },
        _: addMinutesAndFormatWithDate(now, 20),
      },
      miss:'PEBU',
      num:'134626',
      term:'87384008',
    },
    {
      date:{
        '$':{ mode:'R' },
        _: addMinutesAndFormatWithDate(now, 30),
      },
      miss:'NOPE',
      num:'135183',
      term:'87386318',
    },
  ];
};

module.exports = {
  path: '/transilien/gare/:stationId/depart',
  method: 'GET',
  template: {
    passages:{
      '$':{
        gare: ({ stationId }) => stationId,
      },
      train: () => getTrain(),
    },
  },
};
