/* @flow */

import moment from 'moment-timezone';

import type Moment from 'moment';

import { NOTIF_TRANSPORT } from '../../support/notifications';
import LegacyApi from '../../support/legacyApi'; 
import { Status, TimeModes } from '../../support/status';

import type { TimeInfo } from '../../types/Time';
import type { LegacySchedule, LegacyResponse, Schedule, ServerScheduleResponse } from '../../types/Transport';

const { createIndexFromResponse } = LegacyApi;

const { 
  APPROACHING,
  AT_PLATFORM,
  AT_STOP,
  DELAYED,
  ON_TIME,
  SKIPPED,
  TERMINAL,
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
const MESSAGE_TERMINAL = 'Train terminus';

const ResponseProcessor = {
  /**
   * @private
   */
  now: function(): Moment {
    return moment();
  },

  /**
   * @private
   */
  getAdditionalInfo: function(schedule: LegacySchedule): ?string {
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
  getStatus: function(schedule: LegacySchedule): string {
    const { message } = schedule;

    if (REGEX_METRO_TIME.test(message) || REGEX_RER_TIME.test(message)) return ON_TIME;

    if (message.indexOf(MESSAGE_UNSERVED) !== -1 || message.indexOf(MESSAGE_BYPASSED) !== -1) return SKIPPED;

    if (message.indexOf(MESSAGE_TERMINAL) !== -1) return TERMINAL;

    return statuses[message] || UNKNOWN;
  },

  /**
   * @private
   */
  getTimeInfo: function(schedule: LegacySchedule): TimeInfo {
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
  dataToSchedule: function(data: LegacyResponse): ServerScheduleResponse|{} {
    if (!data.result) return {};
    
    const {result: {schedules}} = data;

    const targetSchedules: Array<Schedule> = schedules.map((schedule: LegacySchedule) => (
      {
        ...ResponseProcessor.getTimeInfo(schedule),
        code: schedule.code || null,
        destination: schedule.destination,
        status: ResponseProcessor.getStatus(schedule),
        info: ResponseProcessor.getAdditionalInfo(schedule),
      }
    ));

    const response: ServerScheduleResponse = {
      id: createIndexFromResponse(data),
      lastUpdate: ResponseProcessor.now().toISOString(),
      schedules: targetSchedules,
    };

    return response;
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
