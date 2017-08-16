/** @flow */

import type { StationConfiguration } from '../../types/Configuration';

const LegacyApi = {
  /**
   * @returns URL to call schedules service
   */
  getScheduleUrl: function (apiBaseV3: string, stopConfig: StationConfiguration): ?string {
    const { type, line, station, destination } = stopConfig;
    if (!type || !line) return null;
    
    return `${apiBaseV3}schedules/${type}/${line.toString().toLowerCase()}/${station || ''}/${destination || ''}`;
  },

  /**
   * @returns URL to call traffic service
   */
  getTrafficUrl: function (apiBaseV3: string, stopConfig: StationConfiguration): ?string {
    const { line } = stopConfig;
    if (!line) return null;

    const [ type, code ] = line;    
    return `${apiBaseV3}traffic/${type}/${code}`;
  },

  /**
   * @returns URL to call velib service
   */
  getVelibUrl: function (apiVelib: string, stopConfig: StationConfiguration): ?string {
    const { station } = stopConfig;
    if (!station) return null;

    return `${apiVelib}&q=${station || ''}`;
  },

  /**
   * @param {LegacyResponse|LegacyTrafficResponse} responseData
   * @returns index for results storage (server side)
   */
  createIndexFromResponse: function (responseData: Object): string {
    return responseData._metadata.call.split('/').slice(-3).join('/').toLowerCase();
  },
  
  /**
  * @returns index for schedules access (client side)
  */
  createIndexFromStopConfig: function(stopConfig: StationConfiguration): ?string {
    const { line, station, destination } = stopConfig;
    if(!line) return null;
    
    return `${line.toString()}/${station || ''}/${destination || ''}`.toLowerCase();
  },

  /**
  * @returns index for traffic access (client side)
  */
  createTrafficIndexFromStopConfig: function(stopConfig: StationConfiguration): ?string {
    const { line } = stopConfig;
    if(!line) return null;    

    const [ type, index ] = line;
    return  `traffic/${type.toString()}/${index.toString()}`.toLowerCase();
  },
};

export default LegacyApi;
