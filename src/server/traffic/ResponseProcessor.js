/* @flow */

import moment from 'moment-timezone';
import { NOTIF_TRAFFIC } from '../../support/notifications.js';
import { createIndexFromResponse } from '../../support/legacyApi'; 

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
  // TODO use types
  processTraffic: (data: Object, context: Object) => {
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

export default ResponseProcessor;
