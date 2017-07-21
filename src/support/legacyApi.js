const LegacyApi = {
  /**
   * @returns URL to call schedules service
   */
  getScheduleUrl: function (apiBaseV3, stopConfig) {
    const { type, line, station, destination } = stopConfig;    
    return `${apiBaseV3}schedules/${type}/${line.toString().toLowerCase()}/${station}/${destination}`;
  },

  /**
   * @returns URL to call traffic service
   */
  getTrafficUrl: function (apiBaseV3, stopConfig) {
    const { line: [ type, code ]  } = stopConfig;    
    return `${apiBaseV3}traffic/${type}/${code}`;
  },

  /**
   * @returns URL to call velib service
   */
  getVelibUrl: function (apiVelib, stopConfig) {
    const { station  } = stopConfig;    
    return `${apiVelib}&q=${station}`;
  },

  /**
   * @returns index for results storage (server side)
   */
  createIndexFromResponse: function (responseData) {
    return responseData._metadata.call.split('/').slice(-3).join('/').toLowerCase();
  },
  
  /**
  * @private
  */
  createIndexFromStopConfig: function(stopConfig) {
    const { line, station, destination } = stopConfig;
    return `${line.toString()}/${station}/${destination || ''}`.toLowerCase();
  },
};

module.exports = LegacyApi;