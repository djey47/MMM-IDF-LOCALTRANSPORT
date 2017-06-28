const { NOTIF_TRANSPORT } = require('../../support/notifications.js');
const xmlToJson = require('../../support/xml.js');

const ResponseProcessor = {
  /**
   * @private
   */
  dataToSchedule: function(data) {
    return data;
  },

  /**
   * Handles Transilien realtime response
   * 
   * @param {any} xmlData 
   * @param {any} context 
   */
  processTransportTransilien: function(xmlData, context) {
    if (context.config.debug) {
      console.log (' *** processTransportTransilien XML data');
      console.log (xmlData);
    }

    const data = xmlToJson(xmlData);

    if (context.config.debug) {
      console.log (' *** processTransportTransilien JSON data');
      console.log (data);
    }

    context.loaded = true;
    context.sendSocketNotification(NOTIF_TRANSPORT, ResponseProcessor.dataToSchedule(data));
  },
};

module.exports = ResponseProcessor;
