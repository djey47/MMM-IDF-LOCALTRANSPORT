/* @flow */

import {
  renderWrapper,
  renderHeader,
  renderTraffic,
  renderNoInfoVelib,
  renderVelib,
} from './renderer.js';

describe('renderWrapper function', () => {
  it('should return correct HTML when not loaded', () => {
    // given-when
    const actual = renderWrapper(false);
    // then
    expect(actual.outerHTML).toMatchSnapshot();
  });

  it('should return correct HTML when loaded', () => {
    // given-when
    const actual = renderWrapper(true);
    // then
    expect(actual.outerHTML).toMatchSnapshot();
  });
});

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
      line: ['BUS', 275],
      label: 'Ulbach',
      stations: '',
    };
    const ratpTraffic = {
      'traffic/bus/275': {
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

describe('renderNoInfoVelib function', () => {
  it('should return correct HTML for table row when label', () => {
    // given
    const stop = {
      line: ['VELIB', 68],
      label: 'Ulbach',
      stations: '',
    };
    // when
    const actual = renderNoInfoVelib(stop);
    // then
    expect(actual.outerHTML).toMatchSnapshot();
  });

  it('should return correct HTML for table cell when no label', () => {
    // given
    const stop = {
      line: ['VELIB', 68],
      stations: 'Stations',
    };
    // when
    const actual = renderNoInfoVelib(stop);
    // then
    expect(actual.outerHTML).toMatchSnapshot();
  });
});

describe('renderVelib function', () => {

  it('should return correct HTML when no history', () => {
    // given
    const stop = {
      line: ['VELIB', 68],
      label: 'Ulbach',
      stations: '',
    };
    const velibHistory = {};
    const config = {};
    const now = new Date();
    // when
    const actual = renderVelib(stop, velibHistory, config, now);
    // then
    expect(actual.outerHTML).toMatchSnapshot();
  });

  it('should return correct HTML when history without trend', () => {
    // given
    const stop = {
      line: ['VELIB', 68],
      stations: 'Stations',
    };
    const velibHistory = {
      Stations: [{
        total: 10,
        bike: 2,
        empty: 8,
        name: 'Opera',
      }],
    };
    const config = {
      trendGraphOff: true,
    };
    const now = new Date(2017, 5, 29, 8, 34, 28);
    // when
    const actual = renderVelib(stop, velibHistory, config, now);
    // then
    expect(actual.outerHTML).toMatchSnapshot();
  });

  it('should return correct HTML when history with trend', () => {
    // given
    const stop = {
      line: ['VELIB', 68],
      stations: 'Stations',
    };
    const velibHistory = {
      Stations: [{
        total: 10,
        bike: 2,
        empty: 8,
        name: 'Opera',
      }],
    };
    const config = {};
    const now = new Date(2017, 5, 29, 8, 34, 28);
    // when
    const actual = renderVelib(stop, velibHistory, config, now);
    // then
    expect(actual.outerHTML).toMatchSnapshot();
  });
});
