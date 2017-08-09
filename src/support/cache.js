/* @flow */

/** Very basic cache implementation **/

const infoCache = {};

/**
 * @returns cached value for query if it exists, null otherwise
 */
// TODO use type
export const getInfoFromCache = function(query: string): ?Object {
  return query ? infoCache[query] : null;
};

/**
 * Adds or update value in cache
 */
export const putInfoInCache = function(query: string, stationInfo: Object) {
  if (!query || !stationInfo) return;

  infoCache[query] = stationInfo;
};

/**
 * Clears all values in cache
 */
export const resetInfoCache = function() {
  for (const prop of Object.keys(infoCache)) {
    delete infoCache[prop];
  }
};
