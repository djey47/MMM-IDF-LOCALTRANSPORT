/* @flow */

import type { StationConfiguration } from '../../types/Configuration';

const Transilien = {
  /**
   * @returns index for results access (client side)
   */
  createIndexFromStopConfig: function (stopConfig: StationConfiguration) {
    const { transilienRefData } = stopConfig;
    if (!transilienRefData) return 'ligne/no-data/gare/no-data//stop-monitoring';

    const { stopAreaRef, destinationRef, lineRef } = transilienRefData;
    return `ligne/${lineRef || ''}/gare/${stopAreaRef || ''}/${destinationRef || ''}/stop-monitoring`;
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
