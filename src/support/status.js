/* @flow */

import { MessageKeys as Keys } from './messages';

const {
  STATUS_APPROACHING,
  STATUS_DELAYED,
  STATUS_DELETED,
  STATUS_ON_TIME,
  STATUS_AT_PLATFORM,
  STATUS_AT_STOP,
  STATUS_SKIPPED,
} = Keys;

/**
 * All transportation status codes
 */
export const Status = {
  APPROACHING: 'APPROACHING',
  AT_PLATFORM: 'AT_PLATFORM',
  AT_STOP: 'AT_STOP',
  DELETED: 'DELETED',
  DELAYED: 'DELAYED',
  ON_TIME: 'ON_TIME',
  UNKNOWN: 'UNKNOWN',
  SKIPPED: 'SKIPPED', // RATP only for now
};

/**
 * All schedule modes
 */
export const TimeModes = {
  REALTIME: 'REALTIME',
  THEORICAL: 'THEORICAL',
  UNDEFINED: 'UNDEFINED',
};

/**
 * All associated translation keys
 */
export const MessageKeys = {
  APPROACHING: STATUS_APPROACHING,
  DELETED: STATUS_DELETED,
  DELAYED: STATUS_DELAYED,
  ON_TIME: STATUS_ON_TIME,
  AT_PLATFORM: STATUS_AT_PLATFORM,
  AT_STOP: STATUS_AT_STOP,
  SKIPPED: STATUS_SKIPPED,
};
