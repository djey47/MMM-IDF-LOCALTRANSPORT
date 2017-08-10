/* @flow */

import { NOTIF_VELIB } from '../../support/notifications';

import type { Context } from '../../types/Application';
import type { ServerVelibResponse, VelibResponse } from '../../types/Transport';

const ResponseProcessor = {
  /**
   * Handles Velib realtime response
   * 
   * @param {VelibResponse} data 
   * @param {Context} context 
   */
  processVelib: (data: VelibResponse, context: Context): void => {
    const { number, name, bike_stands, available_bike_stands, available_bikes, last_update } = data.records[0].fields;
    const velibInfo: ServerVelibResponse = {
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

export default ResponseProcessor;
