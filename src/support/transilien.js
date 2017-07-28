const _get = require('lodash/get');

const Transilien = {
  /**
   * @returns index for results storage (server side)
   */
  createIndexFromResponse: function (responseData, destination) {
    return `gare/${_get(responseData, 'passages.$.gare')}/${destination || ''}/depart`;
  },

  /**
   * @returns index for results access (client side)
   */
  createIndexFromStopConfig: function (stopConfig) {
    const { uic } = stopConfig;
    if (!uic) return null;

    const { station, destination } = uic;
    return `gare/${station}/${destination || ''}/depart`;
  },

  /**
   * @returns full call URL to transilien next departures for a station
   */
  getTransilienDepartUrl: function (apiTransilien, stopConfig) {
    const { uic: { station }} = stopConfig;
    return `${apiTransilien}gare/${station}/depart`;
  },
};

module.exports = Transilien;
