/* @flow */

type RefDataCacheOptions = {
  isStopArea: boolean,
}

/** Very basic cache implementation **/

const refDataCache = {};

/**
 * @returns cached value for query if it exists, null otherwise
 */
export const getRefDataFromCache = function(type: string, query: string, options?: RefDataCacheOptions): ?string {
  const key = buildRefDataCacheKey(type, query, options);
  return refDataCache[key] || null;
};

/**
 * Adds or update value in cache
 */
export const putRefDataInCache = function(type: string, query: string, options?: RefDataCacheOptions, refValue: string) {
  if (!refValue) return;
  const key = buildRefDataCacheKey(type, query, options);
  refDataCache[key] = refValue;
};

/**
 * Clears all values in cache
 */
export const resetRefDataCache = function() {
  for (const prop of Object.keys(refDataCache)) {
    delete refDataCache[prop];
  }
};

const buildRefDataCacheKey = (type: string, query: string, options?: RefDataCacheOptions) => `${type}-${query}-${options && options.isStopZone ? 'isStopZone' : ''}`;