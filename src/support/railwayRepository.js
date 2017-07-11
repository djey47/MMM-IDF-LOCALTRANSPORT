const axios = require('axios');

const axiosConfig = {
  headers: {
    Accept: 'application/json;charset=utf-8',
  },
};

/**
 * @private
 */
const getStationInfoUrl = function (sncfApiUrl, query) {
  return encodeURI(`${sncfApiUrl}search?q=${query}&dataset=sncf-gares-et-arrets-transilien-ile-de-france&sort=libelle`);
};

/**
 * @param {Object} query Object with index and stationValue, destinationValue attributes (index is the index within stations array from config)
 * @param {Object} config
 * @returns {Promise} first station/destination info matching provided query (label or UIC), or null if it does not exist
 */
const getStationInfo = function(query, config) {
  const { index, stationValue, destinationValue } = query;
  const { sncfApiUrl, debug } = config;
  
  const axiosPromises = [
    axios.get(getStationInfoUrl(sncfApiUrl, stationValue), axiosConfig), 
    axios.get(getStationInfoUrl(sncfApiUrl, destinationValue), axiosConfig), 
  ];

  return new Promise((resolve, reject) => {
    axios.all(axiosPromises, axiosConfig)
      .then((responses) => {
        const [ stationResponse, destinationResponse ] = responses;

        if (debug) {
          console.log(stationResponse.data);
          console.log(destinationResponse.data);
        }

        if (stationResponse && stationResponse.data && stationResponse.data.records.length) {
          
          if (debug) console.log(`** Station info found for '${stationValue}'`);

          resolve({
            index,
            stationInfo: stationResponse.data.records[0].fields,
            destinationInfo: destinationResponse.data.records[0].fields,
          });
        } else {
        
          if (debug) console.log(`** No station info found for '${query}'`);

          resolve(null);
        }
      },
      (error) => {
        console.error(`** Error invoking API for '${query}'`);
        console.error(error);

        reject(error);
      });
  });
};

/**
 * @param {Object[]} queries requests to get info for
 * @param {Object} config
 * @returns Promise to all first station info matching provided query (label or UIC), or null if it does not exist
 */
function getAllStationInfo(queries, config) {
  return Promise.all(queries.map(query => getStationInfo(query, config)));
}

module.exports = {
  axiosConfig,
  getStationInfo,
  getAllStationInfo,
};
