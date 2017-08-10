/* @flow */

import axios from 'axios';
import _get from 'lodash/get';
import {
  getInfoFromCache,
  putInfoInCache,
} from './cache';

import type { StationInfoQuery, StationInfoResult, SNCFStationInfo } from '../types/Transport';
import type { ModuleConfiguration } from '../types/Configuration';

export const axiosConfig = {
  headers: {
    Accept: 'application/json;charset=utf-8',
  },
};

/**
 * @private
 */
const getInfoUrl = function (apiSncfData: string, query: string): string {
  return encodeURI(`${apiSncfData}search?q=${query}&dataset=sncf-gares-et-arrets-transilien-ile-de-france&sort=libelle`);
};

/**
 * @private
 */
// TODO use types 
const isInfoReceived = function (response: Object): boolean {
  return !!_get(response, 'data.records.length');
};

/**
 * @private
 */
// TODO use types 
export const handleInfoResponsesOnSuccess = function (responses: Array<Object>, resolveCallback: Function, infoQuery: StationInfoQuery, debug: boolean): void {
  const { index, stationValue, destinationValue } = infoQuery;
  const [ stationResponse, destinationResponse ] = responses;

  if (debug) {
    console.log(responses);
  }

  if (isInfoReceived(stationResponse)) {
    const isDestinationInfoReceived = isInfoReceived(destinationResponse);
    
    if (debug) {
      console.log(`** Info found for station '${stationValue}'`);
      if (isDestinationInfoReceived) console.log(`** Info found for destination '${destinationValue || ''}'`);
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
// TODO use types 
const getCachedCallbackForStationInfo = function(index: number, stationInfo: SNCFStationInfo, destinationInfo: ?SNCFStationInfo): Function {
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
// TODO use types 
const getCallbackForStationInfo = function(query: StationInfoQuery, config: ModuleConfiguration): Function {
  const { stationValue, destinationValue } = query;  
  const { apiSncfData, debug } = config;
  return (resolve, reject) => {
    const axiosPromises = [];
    // Mandatory: station
    axiosPromises.push(axios.get(getInfoUrl(apiSncfData, stationValue), axiosConfig));
    // Not mandatory: destination
    if (destinationValue) axiosPromises.push(axios.get(getInfoUrl(apiSncfData, destinationValue), axiosConfig));

    axios.all(axiosPromises)
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
export const getStationInfo = function(query: StationInfoQuery, config: ModuleConfiguration) {
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
export const getAllStationInfo = (queries: Array<StationInfoQuery>, config: ModuleConfiguration): Promise<Array<StationInfoResult>> => {
  return Promise.all(queries.map(query => getStationInfo(query, config)));
};
