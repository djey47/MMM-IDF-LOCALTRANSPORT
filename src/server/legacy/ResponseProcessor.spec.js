/* @flow */

import moment from 'moment';

const ResponseProcessor = require('./ResponseProcessor.js');

ResponseProcessor.now = jest.fn(() => moment('2017-07-16T00:00:00.000Z'));

describe('dataToSchedule function', () => {
  const rerData = {
    result: {
      schedules: [{
        code: 'ZEUS',
        message: '19:07',
        destination: 'St-Germain-en-Laye. Poissy. Cergy.',
      },{
        code: 'TEDU',
        message: '19:10',
        destination: 'St-Germain-en-Laye. Poissy. Cergy.',
      },{
        code: 'ZEUS',
        message: '19:17',
        destination: 'St-Germain-en-Laye. Poissy. Cergy.',
      }],
    },
    _metadata: {
      call: 'GET /schedules/rers/A/Nation/A',
      date: '2017-07-16T19:05:29+02:00',
      version: 3,
    },    
  };

  it('should convert data correctly for RERs', () => {
    // given-when
    const actual = ResponseProcessor.dataToSchedule(rerData);
    // then
    const expected = {
      id: 'A/Nation/A',
      lastUpdate: new Date('2017-06-04T20:10:01.938Z'),
      schedules: [
        {
          destination: 'St-Germain-en-Laye. Poissy. Cergy.',
          time: '2017-07-16T17:07:00.000Z',
          status: 'ZEUS',
        },{
          destination: 'St-Germain-en-Laye. Poissy. Cergy.',
          time: '2017-07-16T17:10:00.000Z',
          status: 'TEDU',
        },{
          destination: 'St-Germain-en-Laye. Poissy. Cergy.',
          time: '2017-07-16T17:17:00.000Z',
          status: 'ZEUS',
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
