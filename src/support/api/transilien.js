/* @flow */

import type { StationConfiguration } from '../../types/Configuration';

const Transilien = {
  /**
   * @returns index for results access (client side)
   */
  createIndexFromStopConfig: function (stopConfig: StationConfiguration) {
    const { transilienRefData } = stopConfig;
    if (!transilienRefData) return 'gare/no-data//depart';

    const { stopAreaRef, destinationRef } = transilienRefData;
    return `gare/${stopAreaRef || ''}/${destinationRef || ''}/depart`;
  },

  /**
   * @returns the full URL to call API for stop monitoring (transilien)
   */
  getTransilienStopMonitoringUrl: function (apiTransilien: string, stopConfig: StationConfiguration): ?string {
    // console.log('getTransilienStopMonitoringUrl', { apiTransilien, stopConfig });

    if (!stopConfig.transilienRefData || !stopConfig.transilienRefData.stopAreaRef || !stopConfig.transilienRefData.lineRef) {
      return undefined;
    }

    const { stopAreaRef, lineRef } = stopConfig.transilienRefData;
    const baseApiUrl = `${apiTransilien}stop-monitoring`;
    const monitoringRef = `STIF:StopArea:SP:${stopAreaRef}:`;
    const fullLineRef = `STIF:Line::${lineRef}:`;
    return `${baseApiUrl}?MonitoringRef=${monitoringRef}&LineRef=${fullLineRef}`;
  },
};

export default Transilien;
