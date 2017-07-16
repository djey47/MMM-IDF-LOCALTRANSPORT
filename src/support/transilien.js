const _get = require('lodash/get');

const Transilien = {
  /**
   * @returns index for results storage (server side)
   */
  createIndexFromResponse: function (responseData) {
    return `gare/${_get(responseData, 'passages.$.gare')}/depart`;
  },

  /**
   * @returns index for results access (client side)
   */
  createIndexFromStopConfig: function (stopConfig) {
    const { uic: { station }} = stopConfig;
    return `gare/${station}/depart`;
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
