/* @flow */

import { getStationByUIC } from './railwayRepository';

describe('getStationRepository function', () => {
  it('should return proper label when uic code exists', () => {
    // given
    const uic = '87384008';
    // when
    const actual = getStationByUIC(uic);
    // then
    expect(actual).toEqual('Paris Saint-Lazare');
  });

  it('should return null when uic code does not exist', () => {
    // given-when
    const actual = getStationByUIC('');
    // then
    expect(actual).toBeNull();
  });
});
