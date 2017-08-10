/* @flow */

import { defaults, enhanceConfiguration, handleStationInfoResponse } from './configuration';

let mockGetAllStationInfo = jest.fn();
const mockThen = jest.fn();
const mockSendSocketNotification = jest.fn();

jest.mock('../../support/railwayRepository', () => ({
  getAllStationInfo: (queries, config) => mockGetAllStationInfo(queries, config),
}) );

beforeEach(() => {
  mockSendSocketNotification.mockReset();
  mockGetAllStationInfo.mockReset();
  mockThen.mockReset();

  mockGetAllStationInfo.mockImplementation(() => ({
    then: mockThen,
  }));
});

describe('handleStationInfoResponse function', () => {
  it('should enhance configuration and send notification', () => {
    // given
    const stations = [{
      type: 'transiliens',
      station: 'becon',
      destination: 'la defense',
    }, {
      type: 'transiliens',
      station: 'la defense',
      destination: 'becon',
    }];    
    const currentConfig = Object.assign({}, defaults, { stations });
    const responses = [{
      index: 0,
      stationInfo: { libelle: 'L1', code_uic: 'UIC1' },
      destinationInfo: { libelle: 'L2', code_uic: 'UIC2'},
    }, {
      index: 1,
      stationInfo: { libelle: 'L2', code_uic: 'UIC2' },
      destinationInfo: { libelle: 'L1', code_uic: 'UIC1'},
    }];
    // when
    handleStationInfoResponse(responses, mockSendSocketNotification, currentConfig);
    // then
    const expectedCodes1 = {
      station: 'UIC1',
      destination: 'UIC2',
    };
    const expectedCodes2 = {
      station: 'UIC2',
      destination: 'UIC1',
    };
    const [ stations1, stations2 ] = currentConfig.stations;
    expect(stations1.uic).toEqual(expectedCodes1);
    expect(stations2.uic).toEqual(expectedCodes2);
    expect(mockSendSocketNotification).toHaveBeenCalledWith('SET_CONFIG', currentConfig);
  });

  it('should ignore missing destination info', () => {
    // given
    const stations = [{
      type: 'transiliens',
      station: 'becon',
    }];    
    const currentConfig = Object.assign({}, defaults, { stations });
    const responses = [{
      index: 0,
      stationInfo: { libelle: 'L1', code_uic: 'UIC1' },
    }];
    // when
    handleStationInfoResponse(responses, mockSendSocketNotification, currentConfig);
    // then
    const expectedCodes = {
      station: 'UIC1',
      destination: null,
    };
    const [ stationsInfo ] = currentConfig.stations;
    expect(stationsInfo.uic).toEqual(expectedCodes);
    expect(mockSendSocketNotification).toHaveBeenCalledWith('SET_CONFIG', currentConfig);
  });
});

describe('enhanceConfiguration function', () => {
  it('should do nothing when no stations provided', () => {
    // given
    const currentConfig = Object.assign({}, defaults);
    // when
    enhanceConfiguration(currentConfig, mockSendSocketNotification);
    // then
    expect(mockGetAllStationInfo).not.toHaveBeenCalled();
    expect(mockSendSocketNotification).toHaveBeenCalledWith('SET_CONFIG', defaults);
  });

  it('should fetch station info from repository', () => {
    // given
    const stations = [{
      type: 'transiliens',
      station: 'becon',
      destination: 'la defense',
    }];
    const currentConfig = Object.assign({}, defaults, { stations });
    // when
    enhanceConfiguration(currentConfig, mockSendSocketNotification);
    // then
    const expectedQueries = [{
      index: 0,
      stationValue: 'becon',
      destinationValue: 'la defense',
    }];
    expect(mockGetAllStationInfo).toHaveBeenCalledWith(expectedQueries, currentConfig);
    expect(mockThen).toHaveBeenCalled();
  });

  it('should fetch station info from repository when missing UIC for destination', () => {
    // given
    const stations = [{
      type: 'transiliens',
      station: 'becon',
      destination: 'la defense',
      uic: {
        station: 'UIC1',
      },
    }];
    const currentConfig = Object.assign({}, defaults, { stations });
    // when
    enhanceConfiguration(currentConfig, mockSendSocketNotification);
    // then
    const expectedQueries = [{
      index: 0,
      stationValue: 'becon',
      destinationValue: 'la defense',
    }];
    expect(mockGetAllStationInfo).toHaveBeenCalledWith(expectedQueries, currentConfig);
    expect(mockThen).toHaveBeenCalled();
  });

  it('should not fetch station info from repository when all UIC provided', () => {
    // given
    const stations = [{
      type: 'transiliens',
      station: 'becon',
      destination: 'la defense',
      uic: {
        station: '8738200',
        destination: '8738221',
      },
    }];
    const currentConfig = Object.assign({}, defaults, { stations });
    // when
    enhanceConfiguration(currentConfig, mockSendSocketNotification);
    // then
    expect(mockGetAllStationInfo).not.toHaveBeenCalled();
    expect(mockSendSocketNotification).toHaveBeenCalledWith('SET_CONFIG', currentConfig);
  });
});
