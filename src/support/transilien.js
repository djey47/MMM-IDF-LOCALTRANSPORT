const Transilien = {
  /**
   * @returns index for results storage (server side)
   */
  createIndexFromResponse: function (url) {
    return url.split('/').slice(-3).join('/');
  },

  /**
   * @returns index for results access (client side)
   */
  createIndexFromStopConfig: function (stopConfig) {
    const { uic: { station }} = stopConfig;
    return `gare/${station}/depart`;
  },

  getTransilienDepartUrl: function (apiTransilien, stopConfig) {
    const { uic: { station }} = stopConfig;
    return `${apiTransilien}gare/${station}/depart`;
  },
};

module.exports = Transilien;
