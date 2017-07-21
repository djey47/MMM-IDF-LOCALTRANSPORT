const moment = require('moment-timezone');
const { NOTIF_TRANSPORT } = require('../../support/notifications.js');
const { createIndexFromResponse } = require('../../support/legacyApi'); 

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
    const { code } = schedule;
    return code;
  },

  /**
   * @private
   */
  getDepartureTime: function(schedule) {
    const { message } = schedule;

    let time = null;
    if (/\d{1,2}:\d{1,2}/.test(message)) {
      // RERs
      const hoursMinutes = moment(message, 'HH:mm');
      time = ResponseProcessor.now()
        .hour(hoursMinutes.hour())
        .minute(hoursMinutes.minute());
    } else if (/\d+ mn/.test(message)) {
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

      delete(schedule.code);
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
