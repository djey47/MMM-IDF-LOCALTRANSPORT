const moment = require('moment-timezone');
const { NOTIF_TRANSPORT } = require('../../support/notifications.js');
const { createIndexFromResponse } = require('../../support/legacyApi'); 
const { Status: {
  APPROACHING,
  AT_PLATFORM,
  ON_TIME,
  DELAYED,
  UNKNOWN,
}} = require('../../support/status.js');

// TODO DELETED?
const statuses = {
  'Train a l\'approche': APPROACHING, // Metro
  'Train a quai': AT_PLATFORM,        // Metro
  'Train à quai': AT_PLATFORM,        // RER
  'Train retarde': DELAYED,           // Metro
};

const REGEX_RER_TIME = /\d{1,2}:\d{1,2}/;
const REGEX_METRO_TIME = /\d+ mn/;

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
  getStatus: function(schedule) {
    const { message } = schedule;

    if (REGEX_METRO_TIME.test(message) || REGEX_RER_TIME.test(message)) return ON_TIME;

    return statuses[message] || UNKNOWN;
  },

  /**
   * @private
   */
  getDepartureTime: function(schedule) {
    const { message } = schedule;

    let time = null;
    if (REGEX_RER_TIME.test(message)) {
      // RERs
      const hoursMinutes = moment(message, 'HH:mm');
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
      return null;
    }

    return time
      .second(0)
      .millisecond(0)
      .toISOString();  
  },

  /**
   * @private
   */
  dataToSchedule: function(data) {
    if (!data.result) return {};
    
    const {result: {schedules}} = data;

    schedules.forEach(schedule => {
      schedule.status = ResponseProcessor.getStatus(schedule);
      schedule.time = ResponseProcessor.getDepartureTime(schedule);

      delete(schedule.message);
    });

    return {
      id: createIndexFromResponse(data),
      lastUpdate: ResponseProcessor.now().toISOString(),
      schedules,
    };
  },

  /**
   * Handles Transilien realtime response
   * 
   * @param {any} xmlData 
   * @param {any} context 
   */
  processTransport: function(data, context) {
    if (context.debug) {
      console.log (' *** processTransport data');
      console.log (data);
    }
    
    context.loaded = true;
    context.sendSocketNotification(NOTIF_TRANSPORT, ResponseProcessor.dataToSchedule(data));
  },
};

module.exports = ResponseProcessor;
