/* @flow */

import {
  createIndexFromResponse,
  createIndexFromStopConfig,
  getTransilienDepartUrl,
} from './transilien';

describe('createIndexFromResponse function', () => {
  it('should return correct index', () => {
    // given
    const response = {
      passages:{
        '$':{
          gare:'87382002',
        },
        train:[],
      },
    };
    // when
    const actual = createIndexFromResponse(response);
    // then
    expect(actual).toEqual('gare/87382002//depart');
  });

  it('should return correct index with destination', () => {
    // given
    const response = {
      passages:{
        '$':{
          gare:'87382002',
        },
        train:[],
      },
    };
    // when
    const actual = createIndexFromResponse(response, 'dest');
    // then
    expect(actual).toEqual('gare/87382002/dest/depart');
  });
});

describe('createIndexFromStopConfig function', () => {
  it('should return null when no UIC codes resolved', () => {
    // given
    const stopConfig = {
      station: 'Becon', 
    };
    // when
    const actual = createIndexFromStopConfig(stopConfig);
    // then
    expect(actual).toBeNull();
  });

  it('should return correct index', () => {
    // given
    const stopConfig = {
      station: 'Becon', 
      uic: {
        station: '87382002',
      },
    };
    // when
    const actual = createIndexFromStopConfig(stopConfig);
    // then
    expect(actual).toEqual('gare/87382002//depart');
  });

  it('should return correct index with destination', () => {
    // given
    const stopConfig = {
      station: 'Becon', 
      uic: {
        station: '87382002',
        destination: '87382210',
      },
    };
    // when
    const actual = createIndexFromStopConfig(stopConfig);
    // then
    expect(actual).toEqual('gare/87382002/87382210/depart');
  });
});

describe('getTransilienDepartUrl function', () => {
  it('should return correct URL', () => {
    // given
    const stopConfig = {
      station: 'Becon', 
      uic: {
        station: '87382002',
      },
    };
    // when
    const actual = getTransilienDepartUrl('http://transilien.api/', stopConfig);
    // then
    expect(actual).toEqual('http://transilien.api/gare/87382002/depart');
  });
});
