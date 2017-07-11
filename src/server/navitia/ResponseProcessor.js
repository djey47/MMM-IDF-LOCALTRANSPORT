const moment = require('moment');
const Navitia = require('../../support/navitia.js');
const { MessageKeys } = require('../../support/messages.js');
const { NOTIF_TRANSPORT } = require('../../support/notifications.js');

const ResponseProcessor = {
  /**
   * @private
   */
  dataToSchedule: function(data) {
    const { stop_schedules, links } = data;
    const schedules = stop_schedules
      .map((schedule) => {
        const { route, date_times } = schedule;

        // TODO move to client side and MessageKeys as well. Transmit raw data only.
        const departureTime = moment(date_times[0].date_time);
        const delta = Math.abs(moment().diff(departureTime));
        const message = delta >= 60000 ? departureTime.format('HH:mm') : MessageKeys.STATUS_APPROACHING;

        return {
          message,
          destination: route.direction.name,
        };
      });
    const callURL = links.slice(-1)[0].href;
    const id = Navitia.createIndexFromURL(callURL);

    return {
      id,
      schedules,
      lastUpdate: new Date(),
    };
  },

  /**
   * Handles navitia stop_schedule response
   * 
   * @param {any} data 
   * @param {any} context 
   */
  processTransportNavitia: function(data, context) {
    if (context.config.debug) {
      console.log (' *** processTransportNavitia data');
      console.log (data);
    }

    context.loaded = true;
    context.sendSocketNotification(NOTIF_TRANSPORT, ResponseProcessor.dataToSchedule(data));
  },
};

module.exports = ResponseProcessor;
