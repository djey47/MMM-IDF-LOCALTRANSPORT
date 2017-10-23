/* @flow */

import { getAllStationInfo } from './railwayRepository';
import { NOTIF_SET_CONFIG } from './notifications';

import { resolveIndexFromStopConfig } from './api/api';

import type { NotificationSenderFunction } from '../types/Application';
import type { ModuleConfiguration, StationConfiguration } from '../types/Configuration';
import type { StationInfoResult } from '../types/Transport';

/**
 * Official module name
 */
export const MODULE_NAME = 'MMM-IDF-LOCALTRANSPORT';

/**
 * Id of wrapper DOM node
 */
export const WRAPPER_ID = 'IDFTransportWrapper';

/**
 * All stop configuration types
 */
export const TYPE_BUS = 'bus';
export const TYPE_METRO = 'metros';
export const TYPE_RER = 'rers';
export const TYPE_TRAMWAY = 'tramways';
export const TYPE_TRANSILIEN = 'transiliens';
export const TYPE_TRAFFIC_LEGACY = 'traffic';
export const TYPE_TRAFFIC_TRANSILIEN = 'transiliensTraffic';
export const TYPE_VELIB = 'velib';

/**
 * Default configuration
 */
export const defaults: ModuleConfiguration = {
  maximumEntries: 2,
  maxTimeOffset: 200,
  updateInterval: 1 * 60 * 1000,
  convertToWaitingTime: true,
  initialLoadDelay: 0,
  maxLettersForDestination: 22,
  concatenateArrivals: true,
  showSecondsToNextUpdate: true,
  showLastUpdateTime: false,
  oldUpdateOpacity: 0.5,
  oldThreshold: 0.1,
  debug: false,
  velibGraphWidth: 400,
  velibTrendWidth: 400,
  velibTrendHeight: 100,
  velibTrendTimeScale: 3600,
  velibTrendZoom: 1800,
  velibTrendDay: false,
  trendGraphOff: false,

  apiBaseV3: 'https://api-ratp.pierre-grimaud.fr/v3/',
  apiTransilien: 'http://api.transilien.com/',
  apiVelib: 'https://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel',
  apiAutolib: 'https://opendata.paris.fr/explore/dataset/stations_et_espaces_autolib_de_la_metropole_parisienne/api/',
  apiSncfData: 'https://ressources.data.sncf.com/api/records/1.0/',
  apiCitymapper: 'https://citymapper.com/api/1/',
  transilienToken: 'Basic',
  citymapperToken: '00000000000000000000000000000000',
  messages: {
    ago: 'ago',
    loading: 'Loading connections ...',
    notYet: 'no info yet',
    nextUpdate: 'next update in',
    requestedUpdate: 'update requested',
    unavailable: '-',
    theorical: '?',
    status: {
      approaching: 'Approaching',
      atplatform: 'At platform',
      atstop: 'At stop',
      ontime: '😊⏲',
      deleted: '😞❌',
      delayed: '😐⏳',
      skipped: '❌',
      terminal: '❌ term',
    },
    traffic: {
      ok: '😊',
      okwork: '😐',
      ko: '😞',
    },
    units: {
      minutes: 'mn',
      seconds: 's',
    },
    velib: {
      bikes: 'velibs',
      spaces: 'spaces',
    },
  },

  stations: [],

  blockOrder: {
    traffic: 1,
    schedules: 2,
    velib: 3,
  },   
};

/**
 * Callback to handle async response.
 * Exported for testing.
 * @param {Array<Object>} responses 
 * @param {Function} sendSocketNotification 
 * @param {Object} configuration 
 */
export function handleStationInfoResponse(responses: Array<StationInfoResult>, sendSocketNotification: NotificationSenderFunction, configuration: ModuleConfiguration) {
  const { debug } = configuration;

  responses.forEach(response => {
    if (debug) {
      console.log('** getAllStationInfo response:');
      console.dir(response);
    }

    const { index, stationInfo, destinationInfo } = response;
    configuration.stations[index].uic = {
      station: stationInfo.code_uic,
      destination: destinationInfo ? destinationInfo.code_uic : null,
    };

    // TODO use MM2 logger (available in client context ?)
    const { station, destination, uic } = configuration.stations[index];
    if (uic) {
      console.log(`** ${MODULE_NAME}: Configuration resolved UIC codes:`);
      console.log(`station: ${station || '/'} => ${uic.station || '/'} , destination: ${destination || '/'} => ${uic.destination || '/'}`);
    } else {
      console.error(`** ${MODULE_NAME}: Configuration resolved no UIC codes:`);      
      console.error(`station: ${station || '/'}, destination: ${destination || '/'}`);
    }
  });

  sendSocketNotification(NOTIF_SET_CONFIG, configuration);
}

/**
 * Resolves useful information from module configuration (station UIC ...)
 * Sends configuration to server-side via sockets.
 * @param {Object} configuration configuration to be enhanced
 * @param {Function} sendSocketNotification callback to notification handler
 */
export function enhanceConfiguration(configuration: ModuleConfiguration, sendSocketNotification: (notification: string, payload: Object) => void) {
  const { stations } = configuration;
  // Stations for transilien: retrieve UIC
  const queries = stations
    .filter(stationConfig => stationConfig.type === TYPE_TRANSILIEN)
    .filter(stationConfig => {
      // Do not resolve to UIC codes if already provided
      const { destination, uic } = stationConfig;      
      return !uic || !uic.station || destination && !uic.destination;
    })
    .map((stationConfig, index)  => {
      const { station, destination } = stationConfig;
      
      if(!station) {
        console.error(`** ${MODULE_NAME}: Configuration does not contain station:`);
        console.error(stationConfig);
      }
      
      return {
        index,
        stationValue: station || '?',
        destinationValue: destination,
      };
    });

  if (queries.length) {
    getAllStationInfo(queries, configuration)
      .then(responses => handleStationInfoResponse(responses, sendSocketNotification, configuration));
  } else {
    sendSocketNotification(NOTIF_SET_CONFIG, configuration);
  }
}

/**
 * @returns StationConfiguration with provided identifier if it exists, undefined otherwise.
 */
export function fetchStopConfiguration(config: ModuleConfiguration, id: string): StationConfiguration {
  const { stations } = config;
  const result = stations.filter(station => resolveIndexFromStopConfig(station) === id);
  return result[0];
}
