const moment = require('moment');
const { NOTIF_TRANSPORT } = require('../../support/notifications.js');
const { createIndexFromResponse } = require('../../support/legacyApi'); 

const ResponseProcessor = {
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
  dataToSchedule: function(data) {
    if (!data.result) return {};
    
    const {result: {schedules}} = data;

    schedules.forEach(schedule => {
      const { message } = schedule;
      schedule.status = ResponseProcessor.getStatus(schedule);
      // TODO Metros: next arrival with format 'xx mn'
      const hoursMinutes = moment(message, 'HH:mm');
      let time = null;
      if (hoursMinutes.isValid()) {
        time = ResponseProcessor.now()
          .hour(hoursMinutes.hour())
          .minute(hoursMinutes.minute())
          .second(0)
          .millisecond(0)
          .toISOString();
      }
      schedule.time = time;

      delete(schedule.code);
      delete(schedule.message);
    });

    return {
      id: createIndexFromResponse(data),
      lastUpdate: new Date(),
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
