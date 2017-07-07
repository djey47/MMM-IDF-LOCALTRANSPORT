const axios = require('axios');

const axiosConfig = {
  headers: {
    Accept: 'application/json;charset=utf-8',
  },
};

/**
 * @returns first station info matching provided query (label or UIC), or null if it does not exist
 */
const getStationInfo = function(query, config) {
  const { sncfApiUrl, debug } = config;
  const url = encodeURI(`${sncfApiUrl}search?q=${query}&dataset=sncf-gares-et-arrets-transilien-ile-de-france&sort=libelle`);

  let stationInfo = null;
  axios.get(url, axiosConfig)
    .then((response) => {

      if (debug) console.log(response.data);

      if (response && response.data && response.data.records.length) {
        
        if (debug) console.log(`** Station info found for '${query}'`);

        stationInfo = response.data.records[0].fields;
      } 
      
      if (debug) console.log(`** No station info found for '${query}'`);
    },
    (error) => {
      console.error(`** Error invoking API for '${query}'`);
      console.error(error);
    });

  if (debug) console.log(`** Obtained station info: ${stationInfo}`);

  return stationInfo;
};

module.exports = {
  getStationInfo,
};
