/* @flow */

import moment from 'moment';
import { translate, MessageKeys } from './messages';

/**
 * @returns time with format H:MM:SS from date
 */
export const formatDateFull = (date?: Date) => {
  if (!date) return '';

  return moment(date).format('HH:mm:ss');
};

/**
 * @return time with format HH:MM from YYYYMMDDTHHMMSS string
 */
export const toHoursMinutes = (date?: string): string => {
  if (!date) return '';

  return moment(date).format('HH:mm');
};

/**
 * @return waiting time in minutes from transport time at HH:MM
 */
export const toWaitingTime = (transportTime: string, now: Date, messages: Object): string => {
  if (/^\d{1,2}[:][0-5][0-9]$/.test(transportTime)) {
    const [ transportHours, transportMinutes ] = transportTime.split(':');
    const endDate = new Date(0, 0, 0, Number.parseInt(transportHours), Number.parseInt(transportMinutes));
    const startDate = new Date(0, 0, 0, now.getHours(), now.getMinutes(), now.getSeconds());
    let waitingTime = endDate - startDate;
    if (startDate > endDate) {
      waitingTime += 1000 * 60 * 60 * 24;
    }
    waitingTime = Math.floor(waitingTime / 1000 / 60);
    return `${waitingTime} ${translate(MessageKeys.UNITS_MINUTES, messages)}`;
  }

  return transportTime;
};
