/* @flow */

import moment from 'moment-timezone';
import { toHoursMinutesSeconds, toHoursMinutes, toWaitingTime } from './format';

beforeAll(() => {
  moment.tz.setDefault('UTC');
});

describe('toHoursMinutesSeconds function', () => {
  it('should return empty string when undefined date', () => {
    expect(toHoursMinutesSeconds()).toEqual('');
  });

  it('should return correctly formatted date @midnight', () => {
    // given
    const currentDate = moment('20170601');
    // when
    const actual = toHoursMinutesSeconds(currentDate);
    // then
    expect(actual).toEqual('00:00:00');
  });

  it('should return correctly formatted date', () => {
    // given
    const currentDate = moment('2017-06-01T08:34:28.000Z');
    // when
    const actual = toHoursMinutesSeconds(currentDate);
    // then
    expect(actual).toEqual('08:34:28');
  });
});

describe('toHoursMinutes function', () => {
  it('should return empty string when undefined date', () => {
    expect(toHoursMinutes()).toEqual('');
  });

  it('should return correctly formatted time', () => {
    // given
    const currentDate = '2017-06-01T20:43:28.000Z';
    // when
    const actual = toHoursMinutes(currentDate);
    // then
    expect(actual).toEqual('20:43');
  });
});

describe('toWaitingTime function', () => {
  const now = moment('2017-07-16T23:10:00.000Z');

  it('should return 0 when arrival time has expired', () => {
    // given-when
    const actual = toWaitingTime('2017-07-16T23:08:00.000Z', now, {});
    // then
    expect(actual).toEqual('0 {units.minutes}');
  });

  it('should return duration in minutes when proper time given', () => {
    // given-when
    const actual = toWaitingTime('2017-07-17T00:18:00.000Z', now, {});
    // then
    expect(actual).toEqual('68 {units.minutes}');
  });

  it('should return initial time when unproper time given', () => {
    // given-when
    const actual = toWaitingTime('blabli', now, {});
    // then
    expect(actual).toEqual('blabli');
  });
});
