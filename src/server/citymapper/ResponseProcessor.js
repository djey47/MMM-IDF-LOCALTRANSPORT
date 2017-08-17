/* @flow */

import moment from 'moment-timezone';

import type Moment from 'moment';

import { NOTIF_TRAFFIC } from '../../support/notifications.js';
import CitymapperApi from '../../support/api/citymapper'; 
import { TrafficStatus } from '../../support/status';

import type { Context } from '../../types/Application';
import type { CMRouteInfoResponse, ServerTrafficResponse, CMRouteInfo } from '../../types/Transport';

const { createIndexFromResponse } = CitymapperApi;
const { OK, KO, UNKNOWN } = TrafficStatus;

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
  getStatus: (routeInfo: CMRouteInfo): string => {
    const { status: { level } } = routeInfo;

    if (level === 0) return OK;

    if (level === 1) return KO;

    return UNKNOWN;
  },

  /**
   * Handles Traffic realtime response
   * 
   * @param {LegacyTrafficResponse} data 
   * @param {Context} context 
   */
  processTraffic: (data: CMRouteInfoResponse, context: Context): void => {
    // TODO unit tests
    const [ result ] = data.routes;

    if (context.config.debug) {
      console.log('** Received traffic response:');
      console.log(result);
      console.log('**');
    }
    const  { status: { description, summary }, name } = result;

    const sentResult: ServerTrafficResponse = {
      id: createIndexFromResponse(result),
      lastUpdate: ResponseProcessor.now().toISOString(),
      line: name,
      loaded: true,
      status: ResponseProcessor.getStatus(result),
      message: description,
      summary,
    };
    context.sendSocketNotification(NOTIF_TRAFFIC, sentResult);
  },
};

export default ResponseProcessor;
