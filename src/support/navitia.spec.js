/* @flow */

import { createIndexFromURL, createIndexFromStopConfig } from './navitia';

describe('createIndexFromURL function', () => {
  it('should return correct index', () => {
    // given
    const url = 'https://api.navitia.io/v1/coverage/fr-idf/physical_modes/physical_mode:RapidTransit/stop_points/stop_point:OIF:SP:8738200:800:L/stop_schedules';
    // when
    const actual = createIndexFromURL(url);
    // then
    expect(actual).toEqual('physical_mode:RapidTransit/stop_points/stop_point:OIF:SP:8738200:800:L/stop_schedules');
  });
});

describe('createIndexFromStopConfig function', () => {
  it('should return correct index', () => {
    // given
    const stopConfig = {
      station: 'OIF:SP:8738200:800:L', 
    };
    // when
    const actual = createIndexFromStopConfig(stopConfig);
    // then
    expect(actual).toEqual('physical_mode:RapidTransit/stop_points/stop_point:OIF:SP:8738200:800:L/stop_schedules');
  });
});
