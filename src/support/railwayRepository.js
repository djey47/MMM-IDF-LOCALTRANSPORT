const axios = require('axios');
const _get = require('lodash/get');
const {
  getInfoFromCache,
  putInfoInCache,
} = require('./cache.js');

const axiosConfig = {
  headers: {
    Accept: 'application/json;charset=utf-8',
  },
};

/**
 * @private
 */
const getInfoUrl = function (apiSncfData, query) {
  return encodeURI(`${apiSncfData}search?q=${query}&dataset=sncf-gares-et-arrets-transilien-ile-de-france&sort=libelle`);
};

/**
 * @private
 */
const isInfoReceived = function (response) {
  return !!_get(response, 'data.records.length');
};

/**
 * @private
 */
const handleInfoResponsesOnSuccess = function (responses, resolveCallback, query, debug) {
  const { index, stationValue, destinationValue } = query;
  const [ stationResponse, destinationResponse ] = responses;

  if (debug) {
    console.log(responses);
  }

  if (isInfoReceived(stationResponse)) {
    const isDestinationInfoReceived = isInfoReceived(destinationResponse);
    
    if (debug) {
      console.log(`** Info found for station '${stationValue}'`);
      if (isDestinationInfoReceived) console.log(`** Info found for destination '${destinationValue}'`);
    }

    const stationInfo = stationResponse.data.records[0].fields;
    putInfoInCache(stationValue, stationInfo);
  
    const destinationInfo = isDestinationInfoReceived ? destinationResponse.data.records[0].fields : null;
    if (destinationValue && destinationInfo) putInfoInCache(destinationValue, destinationInfo);

    resolveCallback({
      index,
      stationInfo,
      destinationInfo,
    });
  } else {
  
    if (debug) console.log(`** No station info found for '${stationValue}'`);

    resolveCallback(null);
  }
};

/**
 * @private
 */
const getCachedCallbackForStationInfo = function(index, stationInfo, destinationInfo) {
  return (resolve) => {
    // Station info or Station+Destination info already in cache
    resolve({
      index,
      stationInfo,
      destinationInfo: destinationInfo || null,
    });
  };
};

/**
 * @private 
 */
const getCallbackForStationInfo = function(query, config) {
  const { stationValue, destinationValue } = query;  
  const { apiSncfData, debug } = config;
  return (resolve, reject) => {
    const axiosPromises = [];
    // Mandatory: station
    axiosPromises.push(axios.get(getInfoUrl(apiSncfData, stationValue), axiosConfig));
    // Not mandatory: destination
    if (destinationValue) axiosPromises.push(axios.get(getInfoUrl(apiSncfData, destinationValue), axiosConfig));

    axios.all(axiosPromises, axiosConfig)
      .then(
        (responses) => handleInfoResponsesOnSuccess(responses, resolve, query, debug),
        (error) => {
          console.error('** Error invoking API for:');
          console.dir(query);
          console.error(error);

          reject(error);
        });
  };
};

/**
 * @param {Object} query Object with index and stationValue, destinationValue attributes (index is the index within stations array from config)
 * @param {Object} config
 * @returns {Promise} first station/destination info matching provided query (label or UIC), or null if it does not exist
 */
const getStationInfo = function(query, config) {
  const { index, stationValue, destinationValue } = query;
  
  const stationInfo = getInfoFromCache(stationValue);
  const destinationInfo = destinationValue ? getInfoFromCache(destinationValue) : null;
  let callback;
  if ( stationInfo && (!destinationValue || destinationInfo) ) {
    callback = getCachedCallbackForStationInfo(index, stationInfo, destinationInfo);
  } else {
    callback = getCallbackForStationInfo(query, config);
  }

  return new Promise(callback);
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
  // test exports
  handleInfoResponsesOnSuccess,
};
