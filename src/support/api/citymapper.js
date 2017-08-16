/* @flow */

import type { StationConfiguration } from '../../types/Configuration';
import type { CMRouteInfo } from '../../types/Transport';

// TODO unit tests
const CitymapperApi = {
  /**
   * @param {CMRouteInfo} responseData
   * @returns index for results storage (server side)
   */
  createIndexFromResponse: function (responseData: CMRouteInfo): string {
    return `traffic/transiliens/${responseData.name.toLowerCase()}`;
  },

  /**
   * @returns full call URL to transilien routes info for a line
   */
  getTransilienRouteInfoUrl: function (api: string, stopConfig: StationConfiguration, apiKey: string): ?string {
    const { line } = stopConfig;
    if(!line || typeof(line) !== 'string') return null;

    return `${api}routeinfo?route=transilien-${line.toLowerCase()}&region_id=fr-paris&key=${apiKey}`;
  },

  /**
  * @returns index for traffic access (client side)
  */
  createTrafficIndexFromStopConfig: function(stopConfig: StationConfiguration): ?string {
    const { line } = stopConfig;
    if(!line || typeof(line) !== 'string') return null;    

    return  `traffic/transiliens/${line.toLowerCase()}`;
  },  
};

export default CitymapperApi;
