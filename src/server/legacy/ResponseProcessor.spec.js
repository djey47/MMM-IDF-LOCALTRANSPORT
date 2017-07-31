/* @flow */

import moment from 'moment-timezone';
import ResponseProcessor from './ResponseProcessor.js';

beforeAll(() => {
  moment.tz.setDefault('UTC');
  ResponseProcessor.now = jest.fn(() => moment('2017-07-16T00:00:00.000Z'));
});

describe('dataToSchedule function', () => {
  const rerData = {
    result: {
      schedules: [{
        code: 'ZEUS',
        message: '17:07',
        destination: 'St-Germain-en-Laye. Poissy. Cergy.',
      },{
        code: 'TEDU',
        message: '17:10',
        destination: 'St-Germain-en-Laye. Poissy. Cergy.',
      },{
        code: 'ZEUS',
        message: '17:17',
        destination: 'St-Germain-en-Laye. Poissy. Cergy.',
      }],
    },
    _metadata: {
      call: 'GET /schedules/rers/A/Nation/A',
      date: '2017-07-16T19:05:29+02:00',
      version: 3,
    },    
  };
  const metroData = {
    result: {
      schedules: [{
        message: 'Train retarde',
        destination: 'Pont de Levallois Bécon',
      }, {
        message: '4 mn',
        destination: 'Pont de Levallois Bécon',
      }, {
        message: '7 mn',
        destination: 'Pont de Levallois Bécon',
      }, {
        message: '9 mn',
        destination: 'Pont de Levallois Bécon',
      }],
    },
    '_metadata': {
      call: 'GET /schedules/metros/3/Pereire/A',
      date: '2017-07-21T13:49:30+02:00',
      version: 3,
    },
  };

  it('should convert data correctly for RERs', () => {
    // given-when
    const actual = ResponseProcessor.dataToSchedule(rerData);
    // then
    const expected = {
      id: 'a/nation/a',
      lastUpdate: '2017-07-16T00:00:00.000Z',
      schedules: [
        {
          destination: 'St-Germain-en-Laye. Poissy. Cergy.',
          time: '2017-07-16T17:07:00.000Z',
          status: '',
          code: 'ZEUS',
        },{
          destination: 'St-Germain-en-Laye. Poissy. Cergy.',
          time: '2017-07-16T17:10:00.000Z',
          status: '',
          code: 'TEDU',
        },{
          destination: 'St-Germain-en-Laye. Poissy. Cergy.',
          time: '2017-07-16T17:17:00.000Z',
          status: '',
          code: 'ZEUS',
        },
      ],
    };
    expect(actual).toEqual(expected);
  });

  it('should convert data correctly for metros', () => {
    // given-when
    const actual = ResponseProcessor.dataToSchedule(metroData);
    // then
    const expected = {
      id: '3/pereire/a',
      lastUpdate: '2017-07-16T00:00:00.000Z',
      schedules: [
        {
          destination: 'Pont de Levallois Bécon',
          time: null,
          status: '',
        },{
          destination: 'Pont de Levallois Bécon',
          time: '2017-07-16T00:04:00.000Z',
          status: '',
        },{
          destination: 'Pont de Levallois Bécon',
          time: '2017-07-16T00:07:00.000Z',
          status: '',
        },{
          destination: 'Pont de Levallois Bécon',
          time: '2017-07-16T00:09:00.000Z',
          status: '',
        },
      ],
    };
    expect(actual).toEqual(expected);
  });

  it('should return empty object when incorrect data', () => {
    // given-when
    const actual = ResponseProcessor.dataToSchedule({ foo: {}}, []);
    // then
    expect(actual).toEqual({});
  });
});
