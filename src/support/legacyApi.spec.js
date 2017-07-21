/* @flow */

import {
  getScheduleUrl,
  getTrafficUrl,
  getVelibUrl,
  createIndexFromResponse,
  createIndexFromStopConfig,
} from './legacyApi';

const apiBase = 'http://api/v3/';

describe('getScheduleUrl function', () => {
  it('should return correct URL', () => {
    // given
    const stopConfig = {
      type: 'rers',
      line: 'B',
      station: 'port+royal',
      destination: 'A',
    };
    // when
    const actual = getScheduleUrl(apiBase, stopConfig);
    // then
    expect(actual).toEqual('http://api/v3/schedules/rers/b/port+royal/A');
  });
});

describe('getTrafficUrl function', () => {
  it('should return correct URL', () => {
    // given
    const stopConfig = {
      line: ['metros', 14],
    };
    // when
    const actual = getTrafficUrl(apiBase, stopConfig);
    // then
    expect(actual).toEqual('http://api/v3/traffic/metros/14');
  });
});

describe('getVelibUrl function', () => {
  it('should return correct URL', () => {
    // given
    const apiVelib = 'http://apivelib/';
    const stopConfig = {
      station: 10868,
    };
    // when
    const actual = getVelibUrl(apiVelib, stopConfig);
    // then
    expect(actual).toEqual('http://apivelib/&q=10868');
  });
});

describe('createIndexFromResponse function', () => {
  it('should return correct index', () => {
    // given
    const data = {
      _metadata: {
        call: 'http://api/v3/schedules/rers/b/port+royal/A',
      },
    };
    // when
    const actual = createIndexFromResponse(data);
    // then
    expect(actual).toEqual('b/port+royal/a');
  });
});

describe('createIndexFromStopConfig function', () => {
  it('should return correct index', () => {
    // given
    const stopConfig = {
      type: 'rers',
      line: 'B',
      station: 'port+royal',
      destination: 'A',
    };
    // when
    const actual = createIndexFromStopConfig(stopConfig);
    // then
    expect(actual).toEqual('b/port+royal/a');
  });

  it('should return correct index without destination', () => {
    // given
    const stopConfig = {
      type: 'rers',
      line: 'B',
      station: 'port+royal',
    };
    // when
    const actual = createIndexFromStopConfig(stopConfig);
    // then
    expect(actual).toEqual('b/port+royal/');
  });
});
