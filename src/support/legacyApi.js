const LegacyApi = {
  getScheduleUrl: function (apiBaseV3, stopConfig) {
    const { type, line, station, destination } = stopConfig;    
    return `${apiBaseV3}schedules/${type}/${line.toString().toLowerCase()}/${station}/${destination}`;
  },

  getTrafficUrl: function (apiBaseV3, stopConfig) {
    const { line: [ type, code ]  } = stopConfig;    
    return `${apiBaseV3}traffic/${type}/${code}`;
  },

  getVelibUrl: function (apiVelib, stopConfig) {
    const { station  } = stopConfig;    
    return `${apiVelib}&q=${station}`;
  },
};

module.exports = LegacyApi;