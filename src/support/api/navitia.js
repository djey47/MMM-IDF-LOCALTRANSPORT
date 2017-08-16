const Navitia = {
  /**
   * URL example: https://api.navitia.io/v1/coverage/fr-idf/physical_modes/physical_mode:RapidTransit/stop_points/stop_point:OIF:SP:8738200:800:L/stop_schedules
   * Index: physical_mode:RapidTransit/stop_points/stop_point:OIF:SP:8738200:800:L/stop_schedules
   * @returns index for results storage (server side)
   */
  createIndexFromURL: function (url) {
    return url.split('/').slice(-6).join('/');
  },

  /**
   * @returns indexfor results access (client side)
   */
  createIndexFromStopConfig: function (stopConfig) {
    const { station, line  } = stopConfig;    
    return `physical_mode:RapidTransit/stop_areas/stop_area:${station}/lines/line:${line}/stop_schedules`;
  },

  getNavitiaStopSchedulesUrl: function (apiNavitia, stopConfig) {
    const { station, line  } = stopConfig;    
    return `${apiNavitia}coverage/fr-idf/physical_modes/physical_mode:RapidTransit/stop_areas/stop_area:${station}/lines/line:${line}/stop_schedules`;
  },
};

module.exports = Navitia;