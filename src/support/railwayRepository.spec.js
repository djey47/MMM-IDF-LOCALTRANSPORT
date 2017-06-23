/* @flow */

import { getStationByUIC, getStationInfoByLabel } from './railwayRepository';

describe('getStationByUIC function', () => {
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

describe('getStationInfoByLabel function', () => {
  const config = {
    sncfApiUrl: 'https://ressources.data.sncf.com/api/records/1.0/',
    debug: true,
  };

  // it('should return label when station exists', () => {
  //   // given
  //   const label = 'Lazare';
  //   // when
  //   const actual = getStationInfoByLabel(label, config);
  //   // then
  //   expect(actual.code_uic).toEqual('Paris Saint-Lazare');
  // });

  it('should return null when station does not exist', () => {
    // given-when
    const actual = getStationInfoByLabel('azerty', config);
    // then
    expect(actual).toBeNull();
  });
});
