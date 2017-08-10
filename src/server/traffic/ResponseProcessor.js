/* @flow */

import moment from 'moment-timezone';

import type Moment from 'moment';

import { NOTIF_TRAFFIC } from '../../support/notifications.js';
import LegacyApi from '../../support/legacyApi'; 

import type { Context } from '../../types/Application';
import type { LegacyTrafficResponse, ServerTrafficResponse } from '../../types/Transport';

const { createIndexFromResponse } = LegacyApi;

const ResponseProcessor = {
  /**
   * @private
   */
  now: function(): Moment {
    return moment();
  },

  /**
   * Handles Traffic realtime response
   * 
   * @param {LegacyTrafficResponse} data 
   * @param {Context} context 
   */
  processTraffic: (data: LegacyTrafficResponse, context: Context): void => {
    const { result } = data;

    if (context.config.debug) {
      console.log('** Received traffic response:');
      console.log(result); //line, title, message
      console.log('**');
    }

    const sentResult: ServerTrafficResponse = {
      ...result,
      id: createIndexFromResponse(data),
      lastUpdate: ResponseProcessor.now().toISOString(),
      loaded: true,
    };
    context.sendSocketNotification(NOTIF_TRAFFIC, sentResult);
  },
};

export default ResponseProcessor;
