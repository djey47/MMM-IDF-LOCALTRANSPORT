/* @flow */

import moment from 'moment-timezone';
import ResponseProcessor from './ResponseProcessor';

const mockGetAllStationInfo = jest.fn();
jest.mock('../../support/railwayRepository', () => ({
  getAllStationInfo: (infoQueries, config) => mockGetAllStationInfo(infoQueries, config),
}));

beforeAll(() => {
  moment.tz.setDefault('UTC');
  ResponseProcessor.now = jest.fn(() => moment('2017-06-20T12:45:23.968Z'));
});

beforeEach(() => {
  mockGetAllStationInfo.mockReset();
  mockGetAllStationInfo.mockImplementation(() => ({
    then: () => ({
      catch: () => {},
    }),
  }));
});

const jsonData = {
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
            mode:'T',
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
  const stationInfos = [{
    index: 0,
    stationInfo: {
      libelle: 'Label for UIC 87384008(1)',
      code_uic: '87384008',
    },
  },{
    index: 1,
    stationInfo: {
      libelle: 'Label for UIC 87384008(2)',
      code_uic: '87384008',
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
    const actual = ResponseProcessor.dataToSchedule(jsonData, stopConfig, stationInfos);
    // then
    const expected = {
      id: 'gare/87382002/87384008/depart',
      lastUpdate: '2017-06-20T12:45:23.968Z',
      schedules: [
        {
          destination: 'Label for UIC 87384008(1)',
          code: 'POPI',
          status: 'DELAYED',
          time: '2017-06-20T12:46:00.000Z',
          timeMode: 'REALTIME',
        },{
          destination: 'Label for UIC 87384008(2)',
          code: 'PEBU',
          status: 'ON_TIME',
          time: '2017-06-20T13:41:00.000Z',
          timeMode: 'THEORICAL',
        },
      ],
    };
    expect(actual).toEqual(expected);
  });

  it('should return all schedules with given destination', () => {
    // given-when
    const actual = ResponseProcessor.dataToSchedule(jsonData, stopConfig, stationInfos);
    // then
    // $FlowFixMe: always valid
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
    const actual = ResponseProcessor.dataToSchedule(jsonData, stopConfigFiltered, stationInfos);
    // then
    // $FlowFixMe: always valid
    expect(actual.schedules.length).toEqual(0);
  });
});

describe('processTransportTransilien function', () => {
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
  const context = { config: { debug: false }};
  const expectedQueries = [{
    index: 0,
    stationValue: '87384008',
  }, {
    index: 1,
    stationValue: '87384008',
  }];

  it('should process XML data correctly', () => {
    // given
    // eslint-disable-next-line max-len
    const xmlData = '<?xml version="1.0" encoding="UTF-8"?><passages gare="87384008"><train><date mode="R">20/06/2017 12:46</date><num>135140</num><miss>POPI</miss><term>87384008</term><etat>Retardé</etat></train><train><date mode="R">20/06/2017 12:46</date><num>135140</num><miss>POPI</miss><term>87384008</term><etat>Retardé</etat></train></passages>';
    // when
    ResponseProcessor.processTransportTransilien(xmlData, context, stopConfig);
    // then
    expect(mockGetAllStationInfo).toHaveBeenCalledWith(expectedQueries, context.config);
  });

  it('should process XML data when no trains', () => {
    // given
    // eslint-disable-next-line max-len
    const xmlData = '<?xml version="1.0" encoding="UTF-8"?><passages gare="87384008"></passages>';
    // when
    ResponseProcessor.processTransportTransilien(xmlData, context, stopConfig);
    // then
    expect(mockGetAllStationInfo).toHaveBeenCalledWith([], context.config);
  });

  it('should process JSON data correctly', () => {
    // given-when
    ResponseProcessor.processTransportTransilien(jsonData, context, stopConfig);
    // then
    expect(mockGetAllStationInfo).toHaveBeenCalledWith(expectedQueries, context.config);
  });
});
