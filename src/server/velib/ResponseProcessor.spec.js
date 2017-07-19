/* @flow */

import ResponseProcessor from './ResponseProcessor.js';

const sendSocketNotificationMock = jest.fn();

describe('processVelib function', () => {
  const context = {
    config: {},
    sendSocketNotification: sendSocketNotificationMock,
  };

  it('should send notification with correct values', () => {
    // given
    const fields = {
      status: 'OPEN',
      contract_name: 'Paris',
      name: '14111 - DENFERT-ROCHEREAU CASSINI',
      bonus: 'False',
      bike_stands: 24,
      number: 14111,
      last_update: '2017-04-15T12:14:25+00:00',
      available_bike_stands: 24,
      banking: 'True',
      available_bikes: 0,
      address: '18 RUE CASSINI - 75014 PARIS',
      position: [48.8375492922, 2.33598303047],
    };    
    const data = {
      records: [ { fields } ],
    };
    // when
    ResponseProcessor.processVelib(data, context);
    // then
    const expected = {
      bike: 0,
      empty: 24,
      id: 14111,
      last_update: '2017-04-15T12:14:25+00:00',
      loaded: true,
      name: '14111 - DENFERT-ROCHEREAU CASSINI',
      total: 24,
    };    
    expect(sendSocketNotificationMock).toHaveBeenCalledWith('VELIB', expected);
  });
});