/* @flow */

import moment from 'moment-timezone';
import { translate, MessageKeys } from '../../support/messages';

import type Moment from 'moment';

/**
 * @returns time with format H:MM:SS from moment-compliant string (YYYYMMDDTHHMMSS, ISO...)
 */
export const toHoursMinutesSeconds = (date?: string): string => {
  if (!date) return '';

  return moment(date).format('HH:mm:ss');
};

/**
 * @return time with format HH:MM from moment-compliant string (YYYYMMDDTHHMMSS, ISO...)
 */
export const toHoursMinutes = (date?: string): string => {
  if (!date) return '';

  return moment(date).format('HH:mm');
};

/**
 * @return waiting time in minutes from startMoment to transportTime ISO
 */
export const toWaitingTime = (transportTime?: string, startMoment: Moment, messages: Object): string => {
  const endMoment = moment(transportTime);
  if (!endMoment.isValid()) return transportTime || '';

  let waitingTime = Math.floor(endMoment.diff(startMoment) / 1000 / 60);

  if (waitingTime >= 0) return `${waitingTime} ${translate(MessageKeys.UNITS_MINUTES, messages)}`;
  return translate(MessageKeys.UNAVAILABLE, messages);
};
