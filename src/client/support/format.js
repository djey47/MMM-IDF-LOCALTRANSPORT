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
 * @return waiting time in minutes between startTime and transport time ISO
 */
export const toWaitingTime = (transportTime?: string, startTime: Moment, messages: Object): string => {
  const endDate = moment(transportTime);
  if (!endDate.isValid()) return transportTime || '';

  let waitingTime = Math.floor(endDate.diff(startTime) / 1000 / 60);
  return `${waitingTime > 0 ? waitingTime : 0} ${translate(MessageKeys.UNITS_MINUTES, messages)}`;
};
