const { MessageKeys: {
  STATUS_APPROACHING,
  STATUS_DELAYED,
  STATUS_DELETED,
  STATUS_ON_TIME,
  STATUS_AT_PLATFORM,
}} = require('./messages.js');

/**
 * All transportation status codes
 */
const Status = {
  APPROACHING: 'APPROACHING',
  AT_PLATFORM: 'AT_PLATFORM',
  DELETED: 'DELETED',
  DELAYED: 'DELAYED',
  ON_TIME: 'ON_TIME',
  UNKNOWN: 'UNKNOWN',
};

/**
 * All schedule modes
 */
const TimeModes = {
  REALTIME: 'REALTIME',
  THEORICAL: 'THEORICAL',
  UNDEFINED: 'UNDEFINED',
};

/**
 * All associated translation keys
 */
const MessageKeys = {
  APPROACHING: STATUS_APPROACHING,
  DELETED: STATUS_DELETED,
  DELAYED: STATUS_DELAYED,
  ON_TIME: STATUS_ON_TIME,
  AT_PLATFORM: STATUS_AT_PLATFORM,
};

module.exports = {
  Status,
  TimeModes,
  MessageKeys,
};
