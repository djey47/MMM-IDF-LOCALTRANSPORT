/* @flow */

import moment from 'moment-timezone';
import htmlBeautify from 'html-beautify';
import {
  renderWrapper,
  renderHeader,
  renderPublicTransport,
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

describe('renderPublicTransport function', () => {
  mockNow.mockImplementation(() => moment('2017-05-30T12:45:00Z'));
  const stop = {
    line: ['BUS', 275],
    station: 'Ulbach',
    destination: 'La+Defense',
  };
  const stopIndex = 'bus,275/Ulbach/La+Defense';
  const baseConfig = {
    ...defaults,
    convertToWaitingTime: false,
    maxLettersForDestination: 256,
    maximumEntries: 3,
    messages: {},
  };

  it('should return correct HTML when schedule and concatenate arrivals', () => {
    // given
    const schedules = {
      [stopIndex]: [{
        time: '2017-07-16T13:00:00.000Z',
        destination: 'Place Charras',
      },{
        time: '2017-07-16T13:15:00.000Z',
        destination: 'La Défense',       
      },{
        time: '2017-07-16T13:30:00.000Z',
        destination: 'La Défense',       
      }],
    };
    const lastUpdate = {
      [stopIndex]: '2017-05-30T15:00:00.000Z',
    };
    const config = {
      ...baseConfig,
      concatenateArrivals: true,
    };
    // when
    const actual = renderPublicTransport(stop, stopIndex, schedules, lastUpdate, config);
    // then
    expect(testRender(actual)).toMatchSnapshot();    
  });

  it('should return correct HTML when schedules and concatenate arrivals for transilien', () => {
    // given
    const stopIndexTransilien = 'gare/87382002/depart';
    const stopConfigTransilien = {
      type: 'transiliens',
      label: 'Becon',
      station: 'Becon Les Bruyeres',
      destination: 'Saint Nom La breteche',
      uic: {
        station: '87382002',
        destination: '87382481',
      },
    };
    const schedulesTransilien = {
      [stopIndexTransilien]: [{
        destination: 'SAINT-NOM LA BRETECHE FORET DE MARLY',
        code: 'SEBU',
        time: '2017-07-26T11:20:00.000Z',
      },
      {
        destination: 'SAINT-NOM LA BRETECHE FORET DE MARLY',
        code: 'SEBU',
        time: '2017-07-26T11:35:00.000Z',
      },
      {
        destination: 'SAINT-NOM LA BRETECHE FORET DE MARLY',
        code: 'SEBU',
        time: '2017-07-26T11:50:00.000Z',
      },
      {
        destination: 'SAINT-NOM LA BRETECHE FORET DE MARLY',
        code: 'SEBU',
        time: '2017-07-26T12:05:00.000Z',
      },
      {
        destination: 'SAINT-NOM LA BRETECHE FORET DE MARLY',
        code: 'SEBU',
        time: '2017-07-26T12:20:00.000Z',
      }],
    };
    const lastUpdateTransilien = {
      [stopIndexTransilien]: '2017-07-26T13:17:00.000Z',
    };
    const config = {
      ...baseConfig,
      concatenateArrivals: true,
    };
    // when
    const actual = renderPublicTransport(stopConfigTransilien, stopIndexTransilien, schedulesTransilien, lastUpdateTransilien, config);
    // then
    expect(actual.length).toEqual(1);
    expect(testRender(actual)).toMatchSnapshot();    
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
