/* @flow */

import { defaults, enhanceConfiguration, handleStationInfoResponse } from './configuration';

const mockThen = jest.fn();
const mockSendSocketNotification = jest.fn();
const mockGetAllStationInfo = jest.fn(() => ({
  then: mockThen,
}));
jest.mock('../../support/railwayRepository', () => ({
  getAllStationInfo: (queries, config) => mockGetAllStationInfo(queries, config),
}) );

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
      stationInfo: { code_uic: 'UIC1' },
      destinationInfo: { code_uic: 'UIC2'},
    }, {
      index: 1,
      stationInfo: { code_uic: 'UIC2' },
      destinationInfo: { code_uic: 'UIC1'},
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
      stationInfo: { code_uic: 'UIC1' },
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
});
