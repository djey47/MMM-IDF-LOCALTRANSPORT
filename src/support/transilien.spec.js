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
    expect(actual).toEqual('gare/87382002/depart');
  });
});

describe('createIndexFromStopConfig function', () => {
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
    expect(actual).toEqual('gare/87382002/depart');
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
