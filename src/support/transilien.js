/* @flow */

import _get from 'lodash/get';

const Transilien = {
  /**
   * @returns index for results storage (server side)
   */
  createIndexFromResponse: function (responseData: Object, destination?: ?string): string {
    return `gare/${_get(responseData, 'passages.$.gare')}/${destination || ''}/depart`;
  },

  /**
   * @returns index for results access (client side)
   */
  // TODO use type
  createIndexFromStopConfig: function (stopConfig: Object): ?string {
    const { uic } = stopConfig;
    if (!uic) return null;

    const { station, destination } = uic;
    return `gare/${station}/${destination || ''}/depart`;
  },

  /**
   * @returns full call URL to transilien next departures for a station
   */
  // TODO use type
  getTransilienDepartUrl: function (apiTransilien: string, stopConfig: Object) {
    const { uic: { station }} = stopConfig;
    return `${apiTransilien}gare/${station}/depart`;
  },
};

export default Transilien;
