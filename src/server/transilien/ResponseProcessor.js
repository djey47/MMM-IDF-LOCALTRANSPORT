const { NOTIF_TRANSPORT } = require('../../support/notifications.js');
const xmlToJson = require('../../support/xml.js');
const { createIndexFromResponse } = require('../../support/transilien.js'); 

const ResponseProcessor = {
  /**
   * @private
   */
  dataToSchedule: function(data) {
    if (!data.passages) return {};

    // TODO resolve UIC codes to labels
    // TODO use date object instead of label, formatting will be client side
    // TODO use raw field for date, message will be reserved for status
    const schedules = data.passages.train
      .map(({ term, date }) => ({
        destination: term,
        message: date._,
      }));

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
  processTransportTransilien: function(xmlData, context) {
    const { config: { debug } } = context;
    const data = xmlToJson(xmlData);

    if (debug) {
      console.log (' *** processTransportTransilien XML data');
      console.log (xmlData);
      console.log (' *** processTransportTransilien JSON data');
      console.log (data);
    }

    context.loaded = true;
    context.sendSocketNotification(NOTIF_TRANSPORT, ResponseProcessor.dataToSchedule(data));
  },
};

module.exports = ResponseProcessor;
