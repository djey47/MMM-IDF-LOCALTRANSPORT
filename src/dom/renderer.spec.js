/* @flow */

import {
  renderWrapper,
  renderHeader,
  renderTraffic,
  renderPublicTransport,
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
  const data = {
    header: 'Connections',
  };

  it('should return correctly when empty configuration', () => {
    // given-when
    const actual = renderHeader(data, {});
    // then
    expect(actual).toEqual('Connections');
  });

  it('should return correct header when complete configuration', () => {
    // given
    const config = Object.assign({}, baseConfig, { showLastUpdateTime: true, showSecondsToNextUpdate: true });
    // when
    const actual = renderHeader(data, config);
    // then
    expect(actual).toContain(', next update in ');
    expect(actual).toContain('@');
  });

  it('should return correct header when incomplete configuration 1', () => {
    // given
    const config = Object.assign({}, baseConfig, { showSecondsToNextUpdate: true });
    // when
    const actual = renderHeader(data, config);
    // then
    expect(actual).toContain(', next update in ');
    expect(actual).not.toContain('@');
  });

  it('should return correct header when incomplete configuration 2', () => {
    // given
    const config = Object.assign({}, baseConfig, { showLastUpdateTime: true });
    // when
    const actual = renderHeader(data, config);
    // then
    expect(actual).not.toContain(', next update in ');
    expect(actual).toContain('@');
  });

  it('should return simple string when silent configuration', () => {
    // given-when
    const actual = renderHeader(data, baseConfig);
    // then
    expect(actual).toEqual('Connections');
  });
});

describe('renderLocalTransport function', () => {
  const now = new Date('2017/05/30 14:45:00');

  it('should return correct HTML when schedule', () => {
    // given
    const stopIndex = 'bus,275/Ulbach/La+Defense';
    const stop = {
      line: ['BUS', 275],
      stations: 'Ulbach',
      destination: 'La+Defense',
    };
    const busSchedules = {
      [stopIndex]: [{
        message: '15:00',
        destination: 'La Défense',
      },{
        message: '15:05',
        destination: 'Place Charras',       
      }],
    };
    const busLastUpdate = {
      [stopIndex]: '2017/05/30 15:00:00',
    };
    const config = {
      maximumEntries: 2,
      maxLettersForDestination: 256,
    };
    const now = new Date();
    // when
    const actual = renderPublicTransport(stop, busSchedules, busLastUpdate, config, now);
    // then
    expect(actual[0].outerHTML + actual[1].outerHTML).toMatchSnapshot();    
  });

  it('should return correct HTML when schedule and convert to waiting time', () => {
    // given
    const stopIndex = 'bus,275/Ulbach/La+Defense';
    const stop = {
      line: ['BUS', 275],
      stations: 'Ulbach',
      destination: 'La+Defense',
    };
    const busSchedules = {
      [stopIndex]: [{
        message: '15:00',
        destination: 'La Défense',
      },{
        message: '15:15',
        destination: 'Place Charras',       
      }],
    };
    const busLastUpdate = {
      [stopIndex]: '2017/05/30 15:00:00',
    };
    const config = {
      maximumEntries: 2,
      maxLettersForDestination: 256,
      convertToWaitingTime: true,
    };
    // when
    const actual = renderPublicTransport(stop, busSchedules, busLastUpdate, config, now);
    // then
    expect(actual.length).toEqual(2);
    expect(actual[0].outerHTML + actual[1].outerHTML).toMatchSnapshot();    
  });

  it('should return correct HTML when schedule and concatenate arrivals', () => {
    // given
    const stopIndex = 'bus,275/Ulbach/La+Defense';
    const stop = {
      line: ['BUS', 275],
      stations: 'Ulbach',
      destination: 'La+Defense',
    };
    const busSchedules = {
      [stopIndex]: [{
        message: '15:00',
        destination: 'Place Charras',
      },{
        message: '15:15',
        destination: 'La Défense',       
      },{
        message: '15:30',
        destination: 'La Défense',       
      }],
    };
    const busLastUpdate = {
      [stopIndex]: '2017/05/30 15:00:00',
    };
    const config = {
      maximumEntries: 3,
      maxLettersForDestination: 256,
      concatenateArrivals: true,
    };
    // when
    const actual = renderPublicTransport(stop, busSchedules, busLastUpdate, config, now);
    // then
    expect(actual.length).toEqual(2);
    expect(actual[0].outerHTML + actual[1].outerHTML).toMatchSnapshot();    
  });

  it('should return correct HTML when no schedule', () => {
    // given
    const stop = {
      line: ['BUS', 275],
      stations: '',
    };
    const busSchedules = {};
    const config = {
      maximumEntries: 1,
    };
    // when
    const actual = renderPublicTransport(stop, busSchedules, {}, config, now);
    // then
    expect(actual[0].outerHTML).toMatchSnapshot();    
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
