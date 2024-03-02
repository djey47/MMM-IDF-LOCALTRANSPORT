/* @flow */

import { defaults, enhanceConfiguration } from './configuration';

import type { StationConfiguration } from '../types/Configuration';

const mockSendSocketNotification = jest.fn();

beforeEach(() => {
  mockSendSocketNotification.mockReset();
});

describe('configuration support functions', () => {
  describe('enhanceConfiguration function', () => {
    it('should not request any data when no stations provided', () => {
      // given
      const currentConfig = { ...defaults };
      // when
      enhanceConfiguration(currentConfig, mockSendSocketNotification);
      // then
      expect(mockSendSocketNotification).toHaveBeenCalledWith('SET_CONFIG', defaults);
    });    
    
    it('should not enhance config when no stop or line names provided', () => {
      // given
      const stations: StationConfiguration[] = [{
        type: 'transiliens',
      }];
      const currentConfig = { ...defaults, stations };
      // when
      enhanceConfiguration(currentConfig, mockSendSocketNotification);
      // then
      expect(mockSendSocketNotification).toHaveBeenCalledWith('SET_CONFIG', currentConfig);
    });
  
    it('should fetch station info from repository', () => {
      // given
      const stations: StationConfiguration[] = [{
        type: 'transiliens',
        station: 'becon',
        destination: 'la defense',
        line: 'L',
      }];
      const currentConfig = { ...defaults, stations };
      // when
      enhanceConfiguration(currentConfig, mockSendSocketNotification);
      // then
    });
  
    it('should fetch destination station info from repository when missing REF for destination', () => {
      // given
      const stations: StationConfiguration[] = [{
        type: 'transiliens',
        station: 'becon les bruyeres',
        destination: 'la defense',
        line: 'L',
        transilienRefData: {
          stopAreaRef: 'stop-area-ref',
          lineRef: 'line-ref',
        },
      }];
      const currentConfig = {...defaults, stations };
      // when
      enhanceConfiguration(currentConfig, mockSendSocketNotification);
      // then
      const { stations: [station] } = currentConfig;
      expect(station.transilienRefData).not.toBeUndefined();
      if (station.transilienRefData) expect(station.transilienRefData.destinationRef).toBe('473935');
    });
  
    it('should not fetch station info from repository when all REFs provided', () => {
      // given
      const stations: StationConfiguration[] = [{
        type: 'transiliens',
        station: 'becon',
        destination: 'la defense',
        line: 'L',
        transilienRefData: {
          stopAreaRef: '8738200',
          destinationRef: '8738221',
          lineRef: '8738222',
        },
      }];
      const currentConfig = { ...defaults, stations };
      // when
      enhanceConfiguration(currentConfig, mockSendSocketNotification);
      // then
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
});

