/* @flow-disabled */

import { defaults, enhanceConfiguration } from './configuration';

let mockGetAllStationInfo = jest.fn();
const mockThen = jest.fn();
const mockSendSocketNotification = jest.fn();

jest.mock('./railwayRepository', () => ({
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

describe.skip('enhanceConfiguration function', () => {
  it('should not request data when no stations provided', () => {
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

  it('should override endpoints when devMode enabled', () => {
    // given
    const currentConfig =  { ...defaults, devMode: true };
    // when
    enhanceConfiguration(currentConfig, mockSendSocketNotification);
    // then
    expect(mockSendSocketNotification.mock.calls.length).toEqual(1);
    const actualConfig = mockSendSocketNotification.mock.calls[0][1];
    expect(actualConfig.apiBaseV3).toEqual('http://localhost:8088/legacy/');
  });  
});
