const stationRepository = require('../../api/station-repository.json');
const unirest = require('unirest');

/**
 * @returns station label having provided UIC code, or null if it does not exist
 */
const getStationByUIC = function(uic) {
  const normalizedCode = `00${uic}`;
  const occurences = stationRepository
    .filter(station => station.fields.uic === normalizedCode);

  if (occurences.length) {
    return occurences[0].fields.intitule_gare;
  }

  return null;
};

/**
 * @returns first station info matching provided label, or null if it does not exist
 */
const getStationInfoByLabel = function(label, config) {
  const { sncfApiUrl, debug } = config;
  const url = encodeURI(`${sncfApiUrl}search?q=${label}&dataset=sncf-gares-et-arrets-transilien-ile-de-france&sort=libelle`);

  let stationInfo = null;
  unirest.get(url)
    .header({
      'Accept': 'application/json;charset=utf-8',
    })
    .end(function(response) {
      if (response && response.body && response.body.records.length) {
        stationInfo = response.body.records[0].fields;
        if (debug) {
          console.log(`** Station info found for label ${label}`);
          console.dir(stationInfo);
        }        
      } else {
        if (debug) {
          console.log(`** No station info found for label ${label}`);
        }
      }
    });

  return stationInfo;  
};

module.exports = {
  getStationByUIC,
  getStationInfoByLabel,
};
