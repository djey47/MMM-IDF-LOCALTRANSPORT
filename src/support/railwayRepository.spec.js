/* @flow */

import { getStationInfo } from './railwayRepository';

describe('getStationInfo function', () => {
  const config = {
    sncfApiUrl: 'https://ressources.data.sncf.com/api/records/1.0/',
    debug: true,
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
