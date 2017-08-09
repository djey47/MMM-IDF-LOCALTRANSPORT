/* @flow */

import moment from 'moment-timezone';
import { NOTIF_TRANSPORT } from '../../support/notifications.js';
import { createIndexFromResponse } from '../../support/legacyApi'; 
import { Status, TimeModes } from '../../support/status.js';

import type { TimeInfo } from '../../types/Time';

const { 
  APPROACHING,
  AT_PLATFORM,
  AT_STOP,
  DELAYED,
  ON_TIME,
  SKIPPED,
  UNKNOWN,
} = Status;

const {
  REALTIME,
  UNDEFINED,
} = TimeModes;

/**
 * Association between API messages and statuses
 */
const statuses = {
  // TODO DELETED?
  'A l\'arret': AT_STOP,              // Bus
  'Train a l\'approche': APPROACHING, // Metro
  'Train à l\'approche': APPROACHING, // RER
  'Train a quai': AT_PLATFORM,        // Metro
  'Train à quai': AT_PLATFORM,        // RER
  'Train retarde': DELAYED,           // Metro
  'Train retardé': DELAYED,           // RER
};

const REGEX_RER_TIME = /\d{1,2}:\d{1,2}\s?.*/;
const REGEX_METRO_TIME = /\d+ mn/;
const MESSAGE_BYPASSED = 'DEVIATION';
const MESSAGE_UNSERVED = 'ARRET NON DESSERVI';

const ResponseProcessor = {
  /**
   * @private
   */
  now: function() {
    return moment();
  },

  /**
   * @private
   */
  // TODO use type
  getAdditionalInfo: function(schedule: Object): ?string {
    const { message } = schedule;

    if (!REGEX_RER_TIME.test(message)) return null;

    const splittedMessage = message.split(' ');
    if (splittedMessage.length < 2) return null;
    
    const [, ...info] = splittedMessage;
    return info.join(' ');
  },

  /**
   * @private
   */
  // TODO use type
  getStatus: function(schedule: Object): string {
    const { message } = schedule;

    if (REGEX_METRO_TIME.test(message) || REGEX_RER_TIME.test(message)) return ON_TIME;

    if (message.indexOf(MESSAGE_UNSERVED) !== -1 || message.indexOf(MESSAGE_BYPASSED) !== -1) return SKIPPED;

    return statuses[message] || UNKNOWN;
  },

  /**
   * @private
   */
  // TODO use type
  getTimeInfo: function(schedule: Object): TimeInfo {
    const { message } = schedule;

    let time;
    if (REGEX_RER_TIME.test(message)) {
      // RERs
      const [extractedTime] = message.split(' ');
      const hoursMinutes = moment(extractedTime, 'HH:mm');
      time = ResponseProcessor.now()
        .hour(hoursMinutes.hour())
        .minute(hoursMinutes.minute());
    } else if (REGEX_METRO_TIME.test(message)) {
      // Metros and Buses
      const [minutes] = message.split(' ');
      time = ResponseProcessor.now()
        .add(Number(minutes), 'm');
    } else {
      // Other message
      return {
        time: null,
        timeMode: UNDEFINED,
      };
    }

    return {
      time: time
        .second(0)
        .millisecond(0)
        .toISOString(),
      timeMode: REALTIME,
    };
  },

  /**
   * @private
   */
  // TODO use types
  dataToSchedule: function(data: Object): Object {
    if (!data.result) return {};
    
    const {result: {schedules}} = data;

    const targetSchedules = schedules.map(schedule => (
      {
        ...ResponseProcessor.getTimeInfo(schedule),
        code: schedule.code || null,
        destination: schedule.destination,
        status: ResponseProcessor.getStatus(schedule),
        info: ResponseProcessor.getAdditionalInfo(schedule),
      }
    ));

    return {
      id: createIndexFromResponse(data),
      lastUpdate: ResponseProcessor.now().toISOString(),
      schedules: targetSchedules,
    };
  },

  /**
   * Handles realtime response
   * 
   * @param {any} data 
   * @param {any} context 
   */
  processTransport: function(data: Object, context: Object) {
    if (context.debug) {
      console.log (' *** processTransport data');
      console.log (data);
    }
    
    context.loaded = true;
    context.sendSocketNotification(NOTIF_TRANSPORT, ResponseProcessor.dataToSchedule(data));
  },
};

export default ResponseProcessor;
