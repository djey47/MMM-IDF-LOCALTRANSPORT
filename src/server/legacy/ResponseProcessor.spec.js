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
        message: 'Train à quai',
        destination: 'St-Germain-en-Laye. Poissy. Cergy.',
      },{
        code: 'TEDU',
        message: '17:10',
        destination: 'St-Germain-en-Laye. Poissy. Cergy.',
      },{
        code: 'ZEUS',
        message: '17:17 Départ voie B',
        destination: 'St-Germain-en-Laye. Poissy. Cergy.',
      },{
        code: 'BINA',
        message: 'Train terminus V.1',
        destination: 'Boissy-St-Léger. Marne-la-Vallée.',
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
  const busData = {
    result: {
      schedules: [{
        message: 'DEVIATION / ARRET NON DESSERVI',
        destination: 'La Défense',
      }, {
        message: 'DEVIATION / ARRET NON DESSERVI',
        destination: 'La Défense',
      }],
    },
    '_metadata': {
      call: 'GET /schedules/bus/275/Ulbach/A',
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
          time: null,
          timeMode: 'UNDEFINED',
          status: 'AT_PLATFORM',
          code: 'ZEUS',
          info: null,          
        },{
          destination: 'St-Germain-en-Laye. Poissy. Cergy.',
          time: '2017-07-16T17:10:00.000Z',
          timeMode: 'REALTIME',
          status: 'ON_TIME',
          code: 'TEDU',
          info: null,          
        },{
          destination: 'St-Germain-en-Laye. Poissy. Cergy.',
          time: '2017-07-16T17:17:00.000Z',
          timeMode: 'REALTIME',
          status: 'ON_TIME',
          code: 'ZEUS',
          info: 'Départ voie B',          
        },{
          destination: 'Boissy-St-Léger. Marne-la-Vallée.',
          time: null,
          timeMode: 'UNDEFINED',
          status: 'TERMINAL',
          code: 'BINA',
          info: null,          
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
          timeMode: 'UNDEFINED',          
          status: 'DELAYED',
          info: null,
          code: null,
        },{
          destination: 'Pont de Levallois Bécon',
          time: '2017-07-16T00:04:00.000Z',
          timeMode: 'REALTIME',          
          status: 'ON_TIME',
          info: null,
          code: null,
        },{
          destination: 'Pont de Levallois Bécon',
          time: '2017-07-16T00:07:00.000Z',
          timeMode: 'REALTIME',          
          status: 'ON_TIME',
          info: null,
          code: null,
        },{
          destination: 'Pont de Levallois Bécon',
          time: '2017-07-16T00:09:00.000Z',
          timeMode: 'REALTIME',          
          status: 'ON_TIME',
          info: null,
          code: null,
        },
      ],
    };
    expect(actual).toEqual(expected);
  });

  it('should convert data correctly for buses', () => {
    // given-when
    const actual = ResponseProcessor.dataToSchedule(busData);
    // then
    const expected = {
      id: '275/ulbach/a',
      lastUpdate: '2017-07-16T00:00:00.000Z',
      schedules: [
        {
          destination: 'La Défense',
          time: null,
          timeMode: 'UNDEFINED',          
          status: 'SKIPPED',
          info: null,
          code: null,
        },{
          destination: 'La Défense',
          time: null,
          timeMode: 'UNDEFINED',          
          status: 'SKIPPED',
          info: null,
          code: null,
        },
      ],
    };
    expect(actual).toEqual(expected);
  });
});
