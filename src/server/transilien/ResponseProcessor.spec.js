/* @flow */

import moment from 'moment-timezone';
import ResponseProcessor from './ResponseProcessor.js';

beforeAll(() => {
  moment.tz.setDefault('UTC');
  ResponseProcessor.now = jest.fn(() => moment('2017-06-20T12:45:23.968Z'));
});

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
  const stopConfig = {
    type: 'transiliens',
    station: 'becon',
    destination: 'paris saint lazare',
    uic: {
      station: '87382002',
      destination: '87384008',
    },
    label: 'Becon L (trans)',
  };

  it('should convert data correctly', () => {
    // given-when
    const actual = ResponseProcessor.dataToSchedule(data, stopConfig, stationInfos);
    // then
    const expected = {
      id: 'gare/87382002/87384008/depart',
      lastUpdate: moment('2017-06-20T12:45:23.968Z').toDate(),
      schedules: [
        {
          destination: 'Label for UIC 87384008(1)',
          code: 'POPI',
          status: 'DELAYED',
          time: '2017-06-20T12:46:00.000Z',
        },{
          destination: 'Label for UIC 87384008(2)',
          code: 'PEBU',
          status: 'ON_TIME',
          time: '2017-06-20T13:41:00.000Z',
        },
      ],
    };
    expect(actual).toEqual(expected);
  });

  it('should return all schedules with given destination', () => {
    // given-when
    const actual = ResponseProcessor.dataToSchedule(data, stopConfig, stationInfos);
    // then
    expect(actual.schedules.length).toEqual(2);
  });

  it('should return no schedule with given destination', () => {
    // given
    const stopConfigFiltered = {
      type: 'transiliens',
      station: 'becon',
      destination: 'nanterre prefecture',
      uic: {
        station: '87382002',
        destination: '87386318',
      },
      label: 'Becon L (trans)',
    };

    // when
    const actual = ResponseProcessor.dataToSchedule(data, stopConfigFiltered, stationInfos);
    // then
    expect(actual.schedules.length).toEqual(0);
  });
  
  it('should return empty object when incorrect data', () => {
    // given-when
    const actual = ResponseProcessor.dataToSchedule({ foo: {}}, {}, []);
    // then
    expect(actual).toEqual({});
  });
});
