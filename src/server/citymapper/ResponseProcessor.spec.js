/* @flow */

import moment from 'moment-timezone';
import ResponseProcessor from './ResponseProcessor';
import { defaults } from '../../support/configuration';

const sendSocketNotificationMock = jest.fn();

beforeAll(() => {
  moment.tz.setDefault('UTC');
  ResponseProcessor.now = jest.fn(() => moment('2017-07-16T00:00:00.000Z'));
});

describe('processTraffic function', () => {
  const context = {
    config: {...defaults},
    sendSocketNotification: sendSocketNotificationMock,
    loaded: false,
  };

  it('should send notification with correct values for OK traffic', () => {
    // given
    const data = {
      routes: [{
        status: {
          level: 0,
          summary: 'Trafic normal',
        },
        name: 'L',
      }],
    };
    // when
    ResponseProcessor.processTraffic(data, context);
    // then
    expect(sendSocketNotificationMock).toHaveBeenCalledWith(
      'TRAFFIC',
      {
        id: 'traffic/transiliens/l',
        lastUpdate: '2017-07-16T00:00:00.000Z',
        line: 'L',
        loaded: true,
        status: 'OK',
        summary: 'Trafic normal',
      },
    );
  });

  it('should send notification with correct values for KO traffic', () => {
    // given
    const data = {
      routes: [{
        status: {
          level: 2,
          summary: 'summary',
          description: 'description',
        },
        name: 'L',
      }],
    };
    // when
    ResponseProcessor.processTraffic(data, context);
    // then
    expect(sendSocketNotificationMock).toHaveBeenCalledWith(
      'TRAFFIC',
      {
        id: 'traffic/transiliens/l',
        lastUpdate: '2017-07-16T00:00:00.000Z',
        line: 'L',
        loaded: true,
        status: 'KO',
        summary: 'summary',
        message: 'description',
      },
    );
  });
});