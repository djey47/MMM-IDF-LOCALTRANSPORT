/* @flow */

import type { SNCFStationInfo } from '../types/Transport';

/** Very basic cache implementation **/

const infoCache = {};

/**
 * @returns cached value for query if it exists, null otherwise
 */
export const getInfoFromCache = function(query: string): ?SNCFStationInfo {
  return query ? infoCache[query] : null;
};

/**
 * Adds or update value in cache
 */
export const putInfoInCache = function(query: string, stationInfo: SNCFStationInfo) {
  if (!query || !stationInfo) {return;}

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
