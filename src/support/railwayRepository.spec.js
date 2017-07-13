/* @flow */

import {
  getStationInfo,
  getAllStationInfo,
  handleInfoResponsesOnSuccess,
  axiosConfig,
} from './railwayRepository';

const mockThen = jest.fn();
const mockAll = jest.fn(() => ({
  then: () => mockThen(),
}));
const mockGet = jest.fn();
jest.mock('axios', () => ({
  get: (url, axiosConfig) => mockGet(url, axiosConfig),
  all: () => mockAll(),
}));

const mockResolve = jest.fn();

const config = {
  apiSncfData: 'https://foo/bar',
  debug: false,
};

beforeEach(() => {
  mockGet.mockReset();
  mockAll.mockReset();
  mockResolve.mockReset();
});

describe('getStationInfo function', () => {
  it('should return Promise', () => {
    // given
    const query = {
      index: 0,
      stationValue: 'Lazare',
      destinationValue: 'St Cloud',
    };
    // when
    const actual = getStationInfo(query, config);
    // then
    expect(actual).toBeDefined();
    expect(mockAll).toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(mockGet).toHaveBeenCalledWith('https://foo/barsearch?q=St%20Cloud&dataset=sncf-gares-et-arrets-transilien-ile-de-france&sort=libelle', axiosConfig);
    expect(mockGet).toHaveBeenCalledWith('https://foo/barsearch?q=Lazare&dataset=sncf-gares-et-arrets-transilien-ile-de-france&sort=libelle', axiosConfig);
  });
});

describe('getAllStationInfo function', () => {
  it('should return Promise', () => {
    // given
    const queries = [{
      index: 0,
      stationValue: 'Lazare',
      destinationValue: 'St Cloud',
    }, {
      index: 1,
      stationValue: 'Chaville',
      destinationValue: 'Versailles',
    }];
    // when
    const actual = getAllStationInfo(queries, config);
    // then
    expect(actual).toBeDefined();
    expect(mockGet).toHaveBeenCalledTimes(4);
  });
});

describe('handleInfoResponsesOnSuccess function', () => {
  it('should resolve values properly for both station and destination', () => {
    // given
    const responses = [
      {
        data: {
          records: [
            {
              fields: { f1: 'becon' },
            },
          ],
        },
      },
      {
        data: {
          records: [
            {
              fields: { f1: 'st cloud' },
            },
          ],
        },
      },
    ];
    const query = {
      index: 0,
      stationValue: 'Becon',
      destinationValue: 'St Cloud',
    };
    // when
    handleInfoResponsesOnSuccess(responses, mockResolve, query, config.debug);
    // then
    expect(mockResolve).toHaveBeenCalledWith({
      index: 0,
      stationInfo: {
        f1: 'becon',
      },
      destinationInfo: {
        f1: 'st cloud',
      }, 
    });
  });

  it('should resolve values properly for station only', () => {
    // given
    const responses = [
      {
        data: {
          records: [
            {
              fields: { f1: 'becon' },
            },
          ],
        },
      },
    ];
    const query = {
      index: 0,
      stationValue: 'Becon',
    };
    // when
    handleInfoResponsesOnSuccess(responses, mockResolve, query, config.debug);
    // then
    expect(mockResolve).toHaveBeenCalledWith({
      index: 0,
      stationInfo: {
        f1: 'becon',
      },
      destinationInfo: null,
    });
  });

  it('should resolve to null when wrong response', () => {
    // given
    const responses = [
      {
        data: {},
      },
    ];
    const query = {
      index: 0,
      stationValue: 'Becon',
    };
    // when
    handleInfoResponsesOnSuccess(responses, mockResolve, query, config.debug);
    // then
    expect(mockResolve).toHaveBeenCalledWith(null);
  });
});
