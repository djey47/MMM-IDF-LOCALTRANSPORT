const moment = require('moment-timezone');
const { addMinutesAndFormatWithDate } = require('../utils');

const getTrain = () => {
  return [
    {
      date:{
        '$':{ mode:'R' },
        _: addMinutesAndFormatWithDate(moment(), 10),
      },
      etat:'Retardé',
      miss:'POPI',
      num:'135140',
      term:'87384008',
    },
    {
      date:{
        '$':{ mode:'R' },
        _: addMinutesAndFormatWithDate(moment(), 20),
      },
      miss:'PEBU',
      num:'134626',
      term:'87384008',
    },
    {
      date:{
        '$':{ mode:'R' },
        _: addMinutesAndFormatWithDate(moment(), 25),
      },
      etat:'Supprimé',
      miss:'PEBU',
      num:'134627',
      term:'87384008',
    },
    {
      date:{
        '$':{ mode:'R' },
        _: addMinutesAndFormatWithDate(moment(), 30),
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
