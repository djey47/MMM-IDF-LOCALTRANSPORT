/* @flow */

const ResponseProcessor = require('./ResponseProcessor.js');

describe('passagesToInfoQueries function', () => {
  it('should return empty array when incorrect data', () => {
    // given-when
    const actual = ResponseProcessor.passagesToInfoQueries();
    // then
    expect(actual).toEqual([]);
  });

  it('should return queries when correct data', () => {
    // given
    const passages = {
      '$':{
        gare:'87382002',
      },
      train:[
        {
          date:{
            '$':{
              mode:'R',
            },
            _:'20/06/2017 12:46',
          },
          etat:'Retardé',
          miss:'POPI',
          num:'135140',
          term:'87384008',
        },
      ],
    };
    // when
    const actual = ResponseProcessor.passagesToInfoQueries(passages);
    // then
    const expected = [{
      index: 0,
      stationValue: '87384008',
    }];
    expect(actual).toEqual(expected);
  });
});

describe('dataToSchedule function', () => {
  const data = {
    passages:{
      '$':{
        gare:'87382002',
      },
      train:[
        {
          date:{
            '$':{
              mode:'R',
            },
            _:'20/06/2017 12:46',
          },
          etat:'Retardé',
          miss:'POPI',
          num:'135140',
          term:'87384008',
        },
        {
          date:{
            '$':{
              mode:'R',
            },
            _:'20/06/2017 13:41',
          },
          miss:'PEBU',
          num:'134626',
          term:'87384008',
        },
      ],
    },
  };
  const stationInfos = [{
    index: 0,
    stationInfo: {
      libelle: 'Label for UIC 87384008(1)',
    },
  },{
    index: 1,
    stationInfo: {
      libelle: 'Label for UIC 87384008(2)',
    },
  }];

  it('should convert data correctly', () => {
    // given-when
    const actual = ResponseProcessor.dataToSchedule(data, stationInfos);
    // then
    const expected = {
      id: 'gare/87382002/depart',
      lastUpdate: new Date('2017-06-04T20:10:01.938Z'),
      schedules: [
        {
          destination: 'Label for UIC 87384008(1)',
          message: '20/06/2017 12:46',
          time: '2017-06-20T10:46:00.000Z',
        },{
          destination: 'Label for UIC 87384008(2)',
          message: '20/06/2017 13:41',
          time: '2017-06-20T11:41:00.000Z',
        },
      ],
    };
    expect(actual.id).toEqual(expected.id);
    expect(actual.lastUpdate).toBeTruthy();
    expect(actual.schedules).toEqual(expected.schedules);
  });

  it('should return empty object when incorrect data', () => {
    // given-when
    const actual = ResponseProcessor.dataToSchedule({ foo: {}}, []);
    // then
    expect(actual).toEqual({});
  });
});
