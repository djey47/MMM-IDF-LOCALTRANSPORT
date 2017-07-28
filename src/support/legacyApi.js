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
  * @returns index for schedules access (client side)
  */
  createIndexFromStopConfig: function(stopConfig) {
    const { line, station, destination } = stopConfig;
    return `${line.toString()}/${station}/${destination || ''}`.toLowerCase();
  },

  /**
  * @returns index for traffic access (client side)
  */
  createTrafficIndexFromStopConfig: function(stopConfig) {
    const { line: [ type, index ] } = stopConfig;
    return  `traffic/${type.toString()}/${index.toString()}`.toLowerCase();
  },
};

module.exports = LegacyApi;