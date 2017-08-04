/** Very basic cache implementation **/

const infoCache = {};

/**
 * @returns cached value for query if it exists, null otherwise
 */
const getInfoFromCache = function(query) {
  return query ? infoCache[query] : null;
};

/**
 * Adds or update value in cache
 */
const putInfoInCache = function(query, stationInfo) {
  if (!query || !stationInfo) return;

  infoCache[query] = stationInfo;
};

/**
 * Clears all values in cache
 */
const resetInfoCache = function() {
  for (const prop of Object.keys(infoCache)) {
    delete infoCache[prop];
  }
};

module.exports = {
  putInfoInCache,
  resetInfoCache,
  getInfoFromCache,
};