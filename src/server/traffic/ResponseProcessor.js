/* @flow */

import moment from 'moment-timezone';

import type Moment from 'moment';

import { NOTIF_TRAFFIC } from '../../support/notifications.js';
import LegacyApi from '../../support/legacyApi'; 
import { TrafficStatus } from '../../support/status';

import type { Context } from '../../types/Application';
import type { LegacyTrafficResponse, LegacyTrafficInfo, ServerTrafficResponse } from '../../types/Transport';

const { createIndexFromResponse } = LegacyApi;
const { OK, OK_WORK, KO, UNKNOWN } = TrafficStatus;

/**
 * Association between API slugs and statuses
 */
const STATUSES = {
  'normal': OK,
  'normal_trav': OK_WORK,
  'alerte': KO,
};

const ResponseProcessor = {
  /**
   * @private
   */
  now: function(): Moment {
    return moment();
  },

  /**
   * @private
   */
  getStatus: (info: LegacyTrafficInfo): string => {
    return STATUSES[info.slug] || UNKNOWN;
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
      console.log(result);
      console.log('**');
    }

    const sentResult: ServerTrafficResponse = {
      id: createIndexFromResponse(data),
      lastUpdate: ResponseProcessor.now().toISOString(),
      line: result.line,
      loaded: true,
      status: ResponseProcessor.getStatus(result),
      message: result.message,
    };
    context.sendSocketNotification(NOTIF_TRAFFIC, sentResult);
  },
};

export default ResponseProcessor;
