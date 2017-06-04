const moment = require('moment');
const Navitia = require('../../support/navitia.js');

const ResponseProcessor = {
  /**
   * @private
   */
  dataToSchedule: function(data) {
    const { stop_schedules, links } = data;
    const schedules = stop_schedules
      .map((schedule) => {
        const { route, date_times } = schedule;
        const time = moment(date_times[0].date_time).format('HH:mm');
        return {
          message: time,
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
    if (context.debug) {
      console.log (' *** processTransportNavitia data');
      console.log (data);
    }

    context.loaded = true;
    context.sendSocketNotification('TRANSPORT', ResponseProcessor.dataToSchedule(data));
  },
};

module.exports = ResponseProcessor;
