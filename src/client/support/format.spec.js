/* @flow */

import { formatDateFull, toHoursMinutes, toWaitingTime } from './format';

describe('formatDateFull function', () => {
  it('should return empty string when undefined date', () => {
    expect(formatDateFull()).toEqual('');
  });

  it('should return correctly formatted date @midnight', () => {
    // given
    const currentDate = new Date(2017, 6);
    // when
    const actual = formatDateFull(currentDate);
    // then
    expect(actual).toEqual('00:00:00');
  });

  it('should return correctly formatted date', () => {
    // given
    const currentDate = new Date(2017, 5, 29, 8, 34, 28);
    // when
    const actual = formatDateFull(currentDate);
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
    const currentDate = '20170604T204300';
    // when
    const actual = toHoursMinutes(currentDate);
    // then
    expect(actual).toEqual('20:43');
  });
});

describe('toWaitingTime function', () => {
  it('should return 0 when arrival time has expired', () => {
    // given
    const now = new Date(2017, 6, 16, 23, 10, 0, 0);
    // when
    const actual = toWaitingTime('2017-07-16T21:08:00.000Z', now, {}); // GMT
    // then
    expect(actual).toEqual('0 {units.minutes}');
  });

  it('should return duration in minutes when proper time given', () => {
    // given
    const now = new Date(2017, 6, 16, 22, 0, 0, 0);
    // when
    const actual = toWaitingTime('2017-07-16T21:08:00.000Z', now, {}); // GMT
    // then
    expect(actual).toEqual('68 {units.minutes}');
  });

  it('should return initial time when unproper time given', () => {
    // given
    const now = new Date(0, 0, 0, 22, 0, 0, 0);
    // when
    const actual = toWaitingTime('blabli', now, {});
    // then
    expect(actual).toEqual('blabli');
  });
});
