// TODO: unit tests

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

  /**
   * @returns index for results storage (server side)
   */
  createIndexFromResponse: function (responseData) {
    return responseData._metadata.call.split('/').slice(-3).join('/');
  },
  
  /**
  * @private
  */
  createStopIndexFromStopConfig: function(stopConfig) {
    const { line, station, destination } = stopConfig;
    return `${line.toString().toLowerCase()}/${station}/${destination || ''}`;
  },
};

module.exports = LegacyApi;