const _get = require('lodash/get');

/**
 * Keys for translated messages. To be shared between client and server sides.
 */
const MessageKeys = {
  STATUS_APPROACHING: '{status.approaching}',
  UNITS_MINUTES: '{units.minutes}',
};

/**
 * @param {*} key 
 * @param {*} messages 
 * @returns Translated message if corresponding key was found in messages section.
 */
const translate = function(key, messages) {
  if (!key || !messages || !/^{.*}/.test(key)) return key;
  return _get(messages, key.slice(1, -1), key);
};

module.exports = {
  MessageKeys,
  translate,
};
