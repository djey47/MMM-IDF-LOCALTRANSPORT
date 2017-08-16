/* @flow */

import _get from 'lodash/get';

import type { StationConfiguration } from '../../types/Configuration';
import type { TransilienResponse } from '../../types/Transport';

const Transilien = {
  /**
   * @returns index for results storage (server side)
   */
  createIndexFromResponse: function (responseData: TransilienResponse, destination?: ?string): string {
    return `gare/${_get(responseData, 'passages.$.gare')}/${destination || ''}/depart`;
  },

  /**
   * @returns index for results access (client side)
   */
  createIndexFromStopConfig: function (stopConfig: StationConfiguration): ?string {
    const { uic } = stopConfig;
    if (!uic) return null;

    const { station, destination } = uic;
    return `gare/${station || ''}/${destination || ''}/depart`;
  },

  /**
   * @returns full call URL to transilien next departures for a station
   */
  getTransilienDepartUrl: function (apiTransilien: string, stopConfig: StationConfiguration): ?string {
    const { uic } = stopConfig;
    if(!uic) return null;

    const { station } = uic;
    return `${apiTransilien}gare/${station || ''}/depart`;
  },
};

export default Transilien;
