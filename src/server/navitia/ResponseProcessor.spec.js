/* @flow */

const moment = require('moment');
const ResponseProcessor = require('./ResponseProcessor.js');

describe('dataToSchedule function', () => {
  const data = {
    'stop_schedules': [{ 
      'date_times': [{
        'date_time': '20170604T220600',
      }, {
        'date_time': '20170604T221300',
      }],
      route: {
        direction: {
          name: 'Gare de Versailles Rive Droite (Versailles)',
        },     
      },
    }],
    links: [{
      href: 'https://api.navitia.io/v1/coverage/fr-idf/physical_modes/physical_mode:RapidTransit/stop_points/stop_point:OIF:SP:8738200:800:L/lines/line:OIF:800:LOIF742/stop_schedules',
    }],
  };

  it('should convert data correctly', () => {
    // given-when
    const actual = ResponseProcessor.dataToSchedule(data);
    // then
    const expected = {
      id: 'physical_mode:RapidTransit/stop_points/stop_point:OIF:SP:8738200:800:L/lines/line:OIF:800:LOIF742/stop_schedules',
      lastUpdate: new Date('2017-06-04T20:10:01.938Z'),
      schedules: [{
        destination: 'Gare de Versailles Rive Droite (Versailles)',
        message: '22:06',
      }]};
    expect(actual.id).toEqual(expected.id);
    expect(actual.lastUpdate).toBeTruthy();
    expect(actual.schedules).toEqual(expected.schedules);
  });

  it('should use generic message when about to arrive to station', () => {
    // given
    const testData = {};
    Object.assign(testData, data);
    testData['stop_schedules'][0]['date_times'][0]['date_time'] = moment().format();
    // when
    const actual = ResponseProcessor.dataToSchedule(testData);
    // then
    const schedules = [{
      destination: 'Gare de Versailles Rive Droite (Versailles)',
      message: '{status.approaching}',
    }];
    expect(actual.schedules).toEqual(schedules);
  });
});
