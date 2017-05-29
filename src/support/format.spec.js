/* @flow */

import { formatDateFull } from './format';

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
    expect(actual).toEqual('0:00:00');
  });

  it('should return correctly formatted date', () => {
    // given
    const currentDate = new Date(2017, 5, 29, 8, 34, 28);
    // when
    const actual = formatDateFull(currentDate);
    // then
    expect(actual).toEqual('8:34:28');
  });
});
