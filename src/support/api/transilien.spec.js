/* @flow-disabled */

import Transilien from './transilien';

import type { StationConfiguration } from '../../types/Configuration';

const {
  createIndexFromResponseLegacy,
  createIndexFromStopConfig,
  getTransilienStopMonitoringUrl,
} = Transilien;

const baseStopConfig = {
  type: 'transiliens',
  station: 'Becon',
};

describe('createIndexFromStopConfig function', () => {
  it('should return default value when no refs resolved', () => {
    // given
    const stopConfig: StationConfiguration = {
      ...baseStopConfig,
    };
    // when
    const actual = createIndexFromStopConfig(stopConfig);
    // then
    expect(actual).toBe('ligne/no-data/gare/no-data//stop-monitoring');
  });

  it('should return correct index', () => {
    // given
    const stopConfig: StationConfiguration = {
      ...baseStopConfig,
      transilienRefData: {
        stopAreaRef: '46689',
        lineRef: 'C01736',
      },
    };
    // when
    const actual = createIndexFromStopConfig(stopConfig);
    // then
    expect(actual).toEqual('ligne/C01736/gare/46689//stop-monitoring');
  });

  it('should return correct index with destination', () => {
    // given
    const stopConfig: StationConfiguration = {
      ...baseStopConfig,
      transilienRefData: {
        stopAreaRef: '46689',
        lineRef: 'C01736',
        destinationRef: '11111',
      },
    };
    // when
    const actual = createIndexFromStopConfig(stopConfig);
    // then
    expect(actual).toEqual('ligne/C01736/gare/46689/11111/stop-monitoring');
  });
});

describe('getTransilienStopMonitoringUrl function', () => {
  it('should return correct URL', () => {
    // given
    const stopConfig: StationConfiguration = {
      ...baseStopConfig,
      transilienRefData: {
        stopAreaRef: '46689',
        lineRef: 'C01736',
      },
    };
    // when
    const actual = getTransilienStopMonitoringUrl('http://transilien.api/', stopConfig);
    // then
    expect(actual).toEqual('http://transilien.api/stop-monitoring?MonitoringRef=STIF:StopArea:SP:46689:&LineRef=STIF:Line::C01736:');
  });
});
