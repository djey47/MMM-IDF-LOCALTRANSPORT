/* @flow */

import CitymapperApi from './citymapper';

import type { StationConfiguration } from '../../types/Configuration';

const {
  getTransilienRouteInfoUrl,
  createTrafficIndexFromResponse,
  createTrafficIndexFromStopConfig,
} = CitymapperApi;

describe('getTransilienRouteInfoUrl function', () => {
  it('should return correct URL', () => {
    // given
    const apiBase = 'http://api/';
    const apiKey= 'apikey';
    const stopConfig: StationConfiguration = {
      type: 'transiliensTraffic',
      line: 'L',
    };
    // when
    const actual = getTransilienRouteInfoUrl(apiBase, stopConfig, apiKey);
    // then
    expect(actual).toEqual('http://api/routeinfo?route=transilien-l&region_id=fr-paris&key=apikey');
  });
});

describe('createTrafficIndexFromResponse function', () => {
  it('should return correct index', () => {
    // given
    const data = {
      status: {
        level: 0,
        summary: '',
      },
      name: 'L',
    };
    // when
    const actual = createTrafficIndexFromResponse(data);
    // then
    expect(actual).toEqual('traffic/transiliens/l');
  });
});

describe('createTrafficIndexFromStopConfig function', () => {
  it('should return correct index', () => {
    // given
    const stopConfig = {
      type: 'transiliensTraffic',
      line: 'L',
    };
    // when
    const actual = createTrafficIndexFromStopConfig(stopConfig);
    // then
    expect(actual).toEqual('traffic/transiliens/l');
  });
});
