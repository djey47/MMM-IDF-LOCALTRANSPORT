/* @flow */

import { getStationInfo } from './railwayRepository';

describe('getStationInfo function', () => {
  const config = {
    sncfApiUrl: 'https://url/',
  };

  it('should return null in test context', () => {
    // given
    const query = 'Lazare';
    // when
    const actual = getStationInfo(query, config);
    // then
    expect(actual).toBeNull();
  });
});
