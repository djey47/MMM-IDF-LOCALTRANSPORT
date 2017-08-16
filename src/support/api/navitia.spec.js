/* @flow */

import { createIndexFromURL, createIndexFromStopConfig } from './navitia';

describe('createIndexFromURL function', () => {
  it('should return correct index', () => {
    // given
    const url = 'https://api.navitia.io/v1/coverage/fr-idf/physical_modes/physical_mode:RapidTransit/stop_areas/stop_area:OIF:SA:8738200/lines/line:OIF:800:LOIF742/stop_schedules';
    // when
    const actual = createIndexFromURL(url);
    // then
    expect(actual).toEqual('physical_mode:RapidTransit/stop_areas/stop_area:OIF:SA:8738200/lines/line:OIF:800:LOIF742/stop_schedules');
  });
});

describe('createIndexFromStopConfig function', () => {
  it('should return correct index', () => {
    // given
    const stopConfig = {
      station: 'OIF:SA:8738200', 
      line: 'OIF:800:LOIF742',
    };
    // when
    const actual = createIndexFromStopConfig(stopConfig);
    // then
    expect(actual).toEqual('physical_mode:RapidTransit/stop_areas/stop_area:OIF:SA:8738200/lines/line:OIF:800:LOIF742/stop_schedules');
  });
});
