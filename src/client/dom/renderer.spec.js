/* @flow */

import moment from 'moment-timezone';
import htmlBeautify from 'html-beautify';
import {
  renderWrapper,
  renderHeader,
  renderNoInfoVelib,
  renderVelib,
} from './renderer.js';
import { defaults } from '../../support/configuration';

import type { ModuleConfiguration } from '../../types/Configuration';

const mockNow = jest.fn();
jest.mock('../support/date', () => ({
  now: () => mockNow(),
}));

beforeAll(() => {
  moment.tz.setDefault('UTC');
  mockNow.mockImplementation(() => moment());
});

const testRender = (element: any): String => {
  if (element instanceof Array) {
    const parentNode = document.createElement('table');
    element.forEach(subElement => parentNode.appendChild(subElement));
    return htmlBeautify(parentNode.outerHTML);
  }

  return htmlBeautify(element.outerHTML);
};

describe('renderWrapper function', () => {
  it('should return correct HTML', () => {
    // given-when
    const actual = renderWrapper();
    // then
    expect(testRender(actual)).toMatchSnapshot();
  });
});

describe('renderHeader function', () => {
  const baseConfig = {
    ...defaults,
    messages: {},
    lastUpdate: moment('2017-07-27T08:23:40.000Z'),
    showLastUpdateTime: false,
    showSecondsToNextUpdate: false,
  };
  const data = {
    header: 'Connections',
  };

  it('should return correct header when complete configuration', () => {
    // given
    mockNow.mockImplementation(() => moment('2017-07-27T08:23:55Z'));
    const config: ModuleConfiguration = { ...baseConfig, showLastUpdateTime: true, showSecondsToNextUpdate: true };
    // when
    const actual = renderHeader(data, config);
    // then
    expect(actual).toMatchSnapshot();
  });

  it('should return correct header when incomplete configuration 1', () => {
    // given
    mockNow.mockImplementation(() => moment('2017-07-27T08:23:55Z'));
    const config: ModuleConfiguration = { ...baseConfig, showSecondsToNextUpdate: true };
    // when
    const actual = renderHeader(data, config);
    // then
    expect(actual).toMatchSnapshot();
  });

  it('should return correct header when incomplete configuration 2', () => {
    // given
    mockNow.mockImplementation(() => moment('2017-07-27T08:23:55Z'));
    const config: ModuleConfiguration = { ...baseConfig, showLastUpdateTime: true };
    // when
    const actual = renderHeader(data, config);
    // then
    expect(actual).toMatchSnapshot();
  });

  it('should return simple string when silent configuration', () => {
    // given
    mockNow.mockImplementation(() => moment('2017-07-27T08:23:55Z'));
    const config: ModuleConfiguration = { ...baseConfig, showLastUpdateTime: false };
    // when
    const actual = renderHeader(data, config);
    // then
    expect(actual).toMatchSnapshot();
  });
});

const baseStopConfigForVelib = {
  type: 'velibs',
  line: ['VELIB', 68],
};

describe('renderNoInfoVelib function', () => {
  it('should return correct HTML for table row when label', () => {
    // given
    const stop = {
      ...baseStopConfigForVelib,
      label: 'Ulbach',
      station: '',
    };
    // when
    const actual = renderNoInfoVelib(stop);
    // then
    expect(testRender(actual)).toMatchSnapshot();
  });

  it('should return correct HTML for table cell when no label', () => {
    // given
    const stop = {
      ...baseStopConfigForVelib,
      station: 'Stations',
    };
    // when
    const actual = renderNoInfoVelib(stop);
    // then
    expect(testRender(actual)).toMatchSnapshot();
  });
});

describe('renderVelib function', () => {
  it('should return correct HTML when no history', () => {
    // given
    const stop = {
      ...baseStopConfigForVelib,
      label: 'Opera Bis',
      station: '',
    };
    const velibHistory = {};
    const config = {
      ...defaults,
      messages: {},
    };
    // when
    const actual = renderVelib(stop, velibHistory, config);
    // then
    expect(testRender(actual)).toMatchSnapshot();
  });

  it('should return correct HTML when history without trend', () => {
    // given
    const stop = {
      ...baseStopConfigForVelib,
      station: '2209',
    };
    const velibHistory = {
      '2209': [{
        total: 10,
        bike: 2,
        empty: 8,
        name: 'Opera',
      }],
    };
    const config = {
      ...defaults,
      trendGraphOff: true,
      messages: {},
    };
    mockNow.mockImplementationOnce(() => new Date(2017, 5, 29, 8, 34, 28));
    // when
    const actual = renderVelib(stop, velibHistory, config);
    // then
    expect(testRender(actual)).toMatchSnapshot();
  });

  it('should return correct HTML when history with trend', () => {
    // given
    const stop = {
      ...baseStopConfigForVelib,
      station: '2209',
    };
    const velibHistory = {
      '2209': [{
        total: 10,
        bike: 2,
        empty: 8,
        name: 'Opera',
      }],
    };
    const config = { ...defaults };
    mockNow.mockImplementationOnce(() => new Date(2017, 5, 29, 8, 34, 28));
    // when
    const actual = renderVelib(stop, velibHistory, config);
    // then
    expect(testRender(actual)).toMatchSnapshot();
  });
});
