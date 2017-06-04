/* @flow */

import moment from 'moment';

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
export const toHoursMinutes = (date?: string) => {
  if (!date) return '';

  return moment(date).format('HH:mm');
};
