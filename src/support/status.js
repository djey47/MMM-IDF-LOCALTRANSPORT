const { MessageKeys: {
  STATUS_APPROACHING,
  STATUS_DELAYED,
  STATUS_DELETED,
  STATUS_ON_TIME,
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
 * All associated translation keys
 */
const MessageKeys = {
  APPROACHING: STATUS_APPROACHING,
  DELETED: STATUS_DELETED,
  DELAYED: STATUS_DELAYED,
  ON_TIME: STATUS_ON_TIME,
};

module.exports = {
  Status,
  MessageKeys,
};
