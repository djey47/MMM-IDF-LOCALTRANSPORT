/* @flow */

const ResponseProcessor = require('./ResponseProcessor.js');

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

  it('should convert data correctly', () => {
    // given-when
    const actual = ResponseProcessor.dataToSchedule(data);
    // then
    const expected = {
      id: 'gare/87382002/depart',
      lastUpdate: new Date('2017-06-04T20:10:01.938Z'),
      schedules: [
        {
          destination: '87384008',
          message: '20/06/2017 12:46',
        },{
          destination: '87384008',
          message: '20/06/2017 13:41',
        },
      ],
    };
    expect(actual.id).toEqual(expected.id);
    expect(actual.lastUpdate).toBeTruthy();
    expect(actual.schedules).toEqual(expected.schedules);
  });

  it('should return empty object when incorrect data', () => {
    // given-when
    const actual = ResponseProcessor.dataToSchedule({ foo: {}});
    // then
    expect(actual).toEqual({});
  });
});
