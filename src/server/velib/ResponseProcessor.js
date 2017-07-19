const { NOTIF_VELIB } = require('../../support/notifications.js');

const ResponseProcessor = {
  /**
   * Handles Velib realtime response
   * 
   * @param {any} data 
   * @param {any} context 
   */
  processVelib: (data, context) => {
    const { number, name, bike_stands, available_bike_stands, available_bikes, last_update } = data.records[0].fields;
    const velibInfo = {
      id: number,
      name,
      total: bike_stands,
      empty: available_bike_stands,
      bike: available_bikes,
      last_update: last_update,
      loaded: true,
    };
    context.sendSocketNotification(NOTIF_VELIB, velibInfo);
  },
};

module.exports = ResponseProcessor;
