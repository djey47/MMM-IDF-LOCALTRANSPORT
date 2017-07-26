/* @flow */

import moment from 'moment-timezone';
import htmlBeautify from 'html-beautify';
import {
  renderWrapper,
  renderHeader,
  renderTraffic,
  renderPublicTransport,
  renderNoInfoVelib,
  renderVelib,
} from './renderer.js';

beforeAll(() => {
  moment.tz.setDefault('UTC');
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
  it('should return correct HTML when not loaded', () => {
    // given-when
    const actual = renderWrapper(false);
    // then
    expect(testRender(actual)).toMatchSnapshot();
  });

  it('should return correct HTML when loaded', () => {
    // given-when
    const actual = renderWrapper(true);
    // then
    expect(testRender(actual)).toMatchSnapshot();
  });
});

describe('renderHeader function', () => {
  const baseConfig = {
    updateInterval: 60000,
    lastUpdate: new Date(),
    showLastUpdateTime: false,
    showSecondsToNextUpdate: false,
  };
  const data = {
    header: 'Connections',
  };

  it('should return correctly when empty configuration', () => {
    // given-when
    const actual = renderHeader(data, {});
    // then
    expect(actual).toMatchSnapshot();
  });

  it('should return correct header when complete configuration', () => {
    // given
    const config = Object.assign({}, baseConfig, { showLastUpdateTime: true, showSecondsToNextUpdate: true });
    // when
    const actual = renderHeader(data, config);
    // then
    expect(actual).toContain('Connections, {nextUpdate} ');
    expect(actual).toContain('@');
  });

  it('should return correct header when incomplete configuration 1', () => {
    // given
    const config = Object.assign({}, baseConfig, { showSecondsToNextUpdate: true });
    // when
    const actual = renderHeader(data, config);
    // then
    expect(actual).toContain('Connections, {nextUpdate} ');
    expect(actual).not.toContain('@');
  });

  it('should return correct header when incomplete configuration 2', () => {
    // given
    const config = Object.assign({}, baseConfig, { showLastUpdateTime: true });
    // when
    const actual = renderHeader(data, config);
    // then
    expect(actual).toContain('Connections');
    expect(actual).not.toContain(', next update in ');
    expect(actual).toContain('@');
  });

  it('should return simple string when silent configuration', () => {
    // given-when
    const actual = renderHeader(data, baseConfig);
    // then
    expect(actual).toMatchSnapshot();
  });
});

describe('renderPublicTransport function', () => {
  const now = moment('2017-05-30T12:45:00Z');
  const stop = {
    line: ['BUS', 275],
    station: 'Ulbach',
    destination: 'La+Defense',
  };
  const stopIndex = 'bus,275/Ulbach/La+Defense';
  const baseConfig = {
    maxLettersForDestination: 256,
    maximumEntries: 3,  
  };

  // it('should return correct HTML when message to be translated', () => {
  //   // given
  //   const schedules = {
  //     [stopIndex]: [{
  //       message: '{status.approaching}',
  //       time: '2017-07-16T13:00:00.000Z',
  //       destination: 'La Défense',
  //     },{
  //       time: '2017-07-16T13:05:00.000Z',
  //       destination: 'Place Charras',       
  //     }],
  //   };
  //   const lastUpdate = {
  //     [stopIndex]: '2017/05/30 15:00:00',
  //   };
  //   const config = {
  //     maximumEntries: 2,
  //     maxLettersForDestination: 256,
  //     messages: {
  //       status: {
  //         approaching: 'A l`approche',
  //       },
  //     },
  //   };
  //   const now = new Date();
  //   // when
  //   const actual = renderPublicTransport(stop, stopIndex, schedules, lastUpdate, config, now);
  //   // then
  //   expect(actual[0].outerHTML + actual[1].outerHTML).toMatchSnapshot();    
  // });

  it('should return correct HTML when no schedule', () => {
    // given
    const stop = {
      line: ['BUS', 275],
      station: '',
    };
    const schedules = {};
    const config = {
      maximumEntries: 1,
    };
    // when
    const actual = renderPublicTransport(stop, stopIndex, schedules, {}, config, now);
    // then
    expect(testRender(actual)).toMatchSnapshot();    
  });

  it('should return correct HTML when schedule', () => {
    // given
    const schedules = {
      [stopIndex]: [{
        time: '2017-07-16T13:00:00.000Z',
        destination: 'La Défense',
      },{
        time: '2017-07-16T13:05:00.000Z',
        destination: 'Place Charras',       
      }],
    };
    const lastUpdate = {
      [stopIndex]: '2017/05/30 15:00:00',
    };
    // when
    const actual = renderPublicTransport(stop, stopIndex, schedules, lastUpdate, baseConfig, now);
    // then
    expect(testRender(actual)).toMatchSnapshot();    
  });

  it('should return correct HTML when schedule and status info', () => {
    // given
    const schedules = {
      [stopIndex]: [{
        time: '2017-05-30T13:00:00.000Z',
        status: 'STATUS',
        destination: 'La Défense',
      }],
    };
    const lastUpdate = {
      [stopIndex]: '2017/05/30 15:00:00',
    };
    // when
    const actual = renderPublicTransport(stop, stopIndex, schedules, lastUpdate, baseConfig, now);
    // then
    expect(testRender(actual)).toMatchSnapshot();    
  });

  it('should return correct HTML when schedule and convert to waiting time', () => {
    // given
    const schedules = {
      [stopIndex]: [{
        time: '2017-05-30T13:00:00.000Z',
        destination: 'La Défense',
      },{
        time: '2017-05-30T13:15:00.000Z',
        destination: 'Place Charras',       
      }],
    };
    const lastUpdate = {
      [stopIndex]: '2017/05/30 15:00:00',
    };
    const config = {
      ...baseConfig,
      convertToWaitingTime: true,
    };
    // when
    const actual = renderPublicTransport(stop, stopIndex, schedules, lastUpdate, config, now);
    // then
    expect(testRender(actual)).toMatchSnapshot();    
  });

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
      [stopIndex]: '2017/05/30 15:00:00',
    };
    const config = {
      ...baseConfig,
      concatenateArrivals: true,
    };
    // when
    const actual = renderPublicTransport(stop, stopIndex, schedules, lastUpdate, config, now);
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
        status: 'SEBU',
        time: '2017-07-26T11:20:00.000Z',
      },
      {
        destination: 'SAINT-NOM LA BRETECHE FORET DE MARLY',
        status: 'SEBU',
        time: '2017-07-26T11:35:00.000Z',
      },
      {
        destination: 'SAINT-NOM LA BRETECHE FORET DE MARLY',
        status: 'SEBU',
        time: '2017-07-26T11:50:00.000Z',
      },
      {
        destination: 'SAINT-NOM LA BRETECHE FORET DE MARLY',
        status: 'SEBU',
        time: '2017-07-26T12:05:00.000Z',
      },
      {
        destination: 'SAINT-NOM LA BRETECHE FORET DE MARLY',
        status: 'SEBU',
        time: '2017-07-26T12:20:00.000Z',
      }],
    };
    const lastUpdateTransilien = {
      [stopIndexTransilien]: '2017-07-26 13:17:00',
    };
    const config = {
      ...baseConfig,
      concatenateArrivals: true,
    };
    // when
    const actual = renderPublicTransport(stopConfigTransilien, stopIndexTransilien, schedulesTransilien, lastUpdateTransilien, config, now);
    // then
    expect(actual.length).toEqual(1);
    expect(testRender(actual)).toMatchSnapshot();    
  });

});

describe('renderTraffic function', () => {
  it('should return correct HTML for table row', () => {
    // given
    const stop = {
      line: ['BUS', 275],
      label: 'Ulbach Label',
      station: 'Ulbach',
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
    expect(testRender(actual)).toMatchSnapshot();
  });
});

describe('renderNoInfoVelib function', () => {
  it('should return correct HTML for table row when label', () => {
    // given
    const stop = {
      line: ['VELIB', 68],
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
      line: ['VELIB', 68],
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
      line: ['VELIB', 68],
      label: 'Opera Bis',
      station: '',
    };
    const velibHistory = {};
    const config = {};
    const now = new Date();
    // when
    const actual = renderVelib(stop, velibHistory, config, now);
    // then
    expect(testRender(actual)).toMatchSnapshot();
  });

  it('should return correct HTML when history without trend', () => {
    // given
    const stop = {
      line: ['VELIB', 68],
      station: 2209,
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
      trendGraphOff: true,
    };
    const now = new Date(2017, 5, 29, 8, 34, 28);
    // when
    const actual = renderVelib(stop, velibHistory, config, now);
    // then
    expect(testRender(actual)).toMatchSnapshot();
  });

  it('should return correct HTML when history with trend', () => {
    // given
    const stop = {
      line: ['VELIB', 68],
      station: 2209,
    };
    const velibHistory = {
      '2209': [{
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
    expect(testRender(actual)).toMatchSnapshot();
  });
});
