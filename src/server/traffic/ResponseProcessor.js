const moment = require('moment-timezone');
const { NOTIF_TRAFFIC } = require('../../support/notifications.js');
const { createIndexFromResponse } = require('../../support/legacyApi'); 

const ResponseProcessor = {
  /**
   * @private
   */
  now: function() {
    return moment();
  },

  /**
   * Handles Traffic realtime response
   * 
   * @param {any} data 
   * @param {any} context 
   */
  processTraffic: (data, context) => {
    const { result } = data;

    if (context.config.debug) {
      console.log('** Received traffic response:');
      console.log(result); //line, title, message
      console.log('**');
    }

    const sentResult = Object.assign({}, result, {
      id: createIndexFromResponse(data),
      lastUpdate: ResponseProcessor.now().toDate(),
      loaded: true,
    });
    context.sendSocketNotification(NOTIF_TRAFFIC, sentResult);
  },
};

module.exports = ResponseProcessor;
