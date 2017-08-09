/* @flow */
import _get from 'lodash/get';

/**
 * Keys for translated messages. To be shared between client and server sides.
 */
export const MessageKeys = {
  AGO: '{ago}',
  LOADING: '{loading}',
  NEXT_UPDATE: '{nextUpdate}',
  REQ_UPDATE: '{requestedUpdate}',
  NOT_YET: '{notYet}',
  STATUS_APPROACHING: '{status.approaching}',
  STATUS_AT_PLATFORM: '{status.atplatform}',
  STATUS_AT_STOP: '{status.atstop}',
  STATUS_DELAYED: '{status.delayed}',
  STATUS_DELETED: '{status.deleted}',
  STATUS_ON_TIME: '{status.ontime}',
  STATUS_SKIPPED: '{status.skipped}',
  STATUS_TERMINAL: '{status.terminal}',
  UNITS_MINUTES: '{units.minutes}',
  UNITS_SECONDS: '{units.seconds}',
  VELIB_BIKES: '{velib.bikes}',
  VELIB_SPACES: '{velib.spaces}',
  UNAVAILABLE: '{unavailable}',
  THEORICAL: '{theorical}',
};

/**
 * @param {*} key 
 * @param {*} messages 
 * @returns Translated message if corresponding key was found in messages section.
 */
export const translate = function(key: string, messages: ?Object) {
  if (!key || !messages || !/^{.*}/.test(key)) return key;
  return _get(messages, key.slice(1, -1), key);
};
