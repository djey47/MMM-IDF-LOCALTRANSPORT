const Navitia = {
  /**
   * URL example: https://api.navitia.io/v1/coverage/fr-idf/physical_modes/physical_mode:RapidTransit/stop_points/stop_point:OIF:SP:8738200:800:L/stop_schedules
   * Index: physical_mode:RapidTransit/stop_points/stop_point:OIF:SP:8738200:800:L/stop_schedules
   * @returns index for results storage (server side)
   */
  createIndexFromURL: function (url) {
    return url.split('/').slice(-4).join('/');
  },

  /**
   * @returns indexfor results access (client side)
   */
  createIndexFromStopConfig: function (config) {
    const { station  } = config;    
    return `physical_mode:RapidTransit/stop_points/stop_point:${station}/stop_schedules`;
  },
};

module.exports = Navitia;