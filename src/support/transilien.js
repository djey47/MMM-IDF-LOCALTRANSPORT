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
  createIndexFromStopConfig: function (config) {
    const { stationUIC } = config;    
    return `gare/${stationUIC}/departs`;
  },
};

module.exports = Transilien;
