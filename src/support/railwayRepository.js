const unirest = require('unirest');

/**
 * @returns first station info matching provided query (label or UIC), or null if it does not exist
 */
const getStationInfo = function(query, config) {
  const { sncfApiUrl, debug } = config;
  const url = encodeURI(`${sncfApiUrl}search?q=${query}&dataset=sncf-gares-et-arrets-transilien-ile-de-france&sort=libelle`);

  const callPromise = (url) => new Promise((resolve, reject) => unirest.get(url)
    .header({
      'Accept': 'application/json;charset=utf-8',
    })
    .end((response) => {
      if (response && response.body && response.body.records.length) {
        if (debug) {
          console.log(`** Station info found for '${query}'`);
          console.dir(stationInfo);
        }        
        resolve(response.body.records[0].fields);
      } else {
        if (debug) {
          console.log(`** No station info found for '${query}'`);
        }
        reject();
      }
    }));

  let stationInfo = null;
  callPromise(url)
    .then(value => stationInfo = value);

  return stationInfo;  
};

module.exports = {
  getStationInfo,
};
