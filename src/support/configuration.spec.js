/* @flow */

import { defaults, enhanceConfiguration } from './configuration';

const mockStationInfo = {
  code_uic: '87382002',
};
jest.mock('./railwayRepository', () => ({
  getStationInfo: jest.fn(() => mockStationInfo),
}));

describe('enhanceConfiguration function', () => {
  it('should do nothing when no stations provided', () => {
    // given
    // const previousConfig: ModuleConfiguration = {};
    const currentConfig = Object.assign({}, defaults);
    const previousConfig = Object.assign({}, defaults);
    // when
    enhanceConfiguration(currentConfig);
    // then
    expect(currentConfig).toEqual(previousConfig);
  });

  it('should resolve UIC codes for transilien', () => {
    // given
    const stations = [{
      type: 'transiliens',
      station: 'becon',
      destination: 'la defense',
    }];
    const currentConfig = Object.assign({}, defaults, { stations });
    // when
    enhanceConfiguration(currentConfig);
    // then
    const expected = {
      destination: {
        code_uic: '87382002',
      },
      station: {
        code_uic: '87382002',
      },
    };
    expect(currentConfig.stations[0].uic).toEqual(expected);
  });
});
