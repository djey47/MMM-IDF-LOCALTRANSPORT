/* @flow */

import { renderHeader, renderTraffic } from './renderer.js';

describe('renderHeader function', () => {
  const baseConfig = {
    updateInterval: 60000,
    lastUpdate: new Date(),
    showLastUpdateTime: false,
    showSecondsToNextUpdate: false,
  };

  it('should return empty string when empty configuration', () => {
    // given
    const config = {};
    // when
    const actual = renderHeader(config);
    // then
    expect(actual).toEqual('');
  });

  it('should return correct header when complete configuration', () => {
    // given
    const config = Object.assign({}, baseConfig, { showLastUpdateTime: true, showSecondsToNextUpdate: true });
    // when
    const actual = renderHeader(config);
    // then
    expect(actual).toContain(', next update in ');
    expect(actual).toContain('@');
  });

  it('should return correct header when incomplete configuration 1', () => {
    // given
    const config = Object.assign({}, baseConfig, { showSecondsToNextUpdate: true });
    // when
    const actual = renderHeader(config);
    // then
    expect(actual).toContain(', next update in ');
    expect(actual).not.toContain('@');
  });

  it('should return correct header when incomplete configuration 2', () => {
    // given
    const config = Object.assign({}, baseConfig, { showLastUpdateTime: true });
    // when
    const actual = renderHeader(config);
    // then
    expect(actual).not.toContain(', next update in ');
    expect(actual).toContain('@');
  });

  it('should return empty string when silent configuration', () => {
    // given-when
    const actual = renderHeader(baseConfig);
    // then
    expect(actual).toEqual('');
  });
});

describe('renderTraffic function', () => {
  it('should return correct HTML for table row', () => {
    // given
    const stop = {
      line: ['A', 'B'],
      label: 'Ulbach',
    };
    const ratpTraffic = {
      'traffic/a/b': {
        message: 'fluid',
      },
    };
    const config = {
      conversion: {
        fluid: 'fluide',
      },
    };
    // when
    const actual = renderTraffic(stop, ratpTraffic, config);
    // then
    expect(actual.outerHTML).toMatchSnapshot();
  });
});
