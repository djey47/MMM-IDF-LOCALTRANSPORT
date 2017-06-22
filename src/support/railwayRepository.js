const stationRepository = require('../../api/station-repository.json');

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

module.exports = {
  getStationByUIC,
};
