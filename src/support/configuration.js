/* @flow */

import { getAllStationInfo } from './railwayRepository';
import { NOTIF_SET_CONFIG } from './notifications';

import type { NotificationSenderFunction } from '../types/Application';
import type { ModuleConfiguration } from '../types/Configuration';
import type { StationInfoResult } from '../types/Transport';

/**
 * Official module name
 */
export const MODULE_NAME = 'MMM-IDF-LOCALTRANSPORT';

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
  devMode: false,
  velibGraphWidth: 400,
  velibTrendWidth: 400,
  velibTrendHeight: 100,
  velibTrendTimeScale: 3600,
  velibTrendZoom: 1800,
  velibTrendDay: false,
  trendGraphOff: false,

  apiBaseV3: 'https://api-ratp.pierre-grimaud.fr/v3/',
  apiTransilien: 'https://api.transilien.com/',
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
};

/**
 * Default configuration for development environment
 */
const devDefaults = {
  apiBaseV3: 'http://localhost:8088/legacy/',
  apiTransilien: 'http://localhost:8088/transilien/',
  apiSncfData: 'http://localhost:8088/sncf/',
  apiCitymapper: 'http://localhost:8088/citymapper/',
  apiVelib: 'http://localhost:8088/velib/',
  apiAutolib: 'http://localhost:8088/autolib/',
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
      console.log('** All stations info response from SNCF', response);
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
  const { stations, devMode, debug } = configuration;

  if (debug) { console.log(`** ${MODULE_NAME}: Enhancing configuration for stations:`, stations); }

  // Overrides API endpoints in development mode
  const effectiveConfiguration = devMode ? { ...configuration, ...devDefaults } : { ...configuration };

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
    if (debug) { console.log(`** ${MODULE_NAME}: UIC to be resolved:`, queries); }
    getAllStationInfo(queries, effectiveConfiguration)
      .then(responses => handleStationInfoResponse(responses, sendSocketNotification, effectiveConfiguration));
  } else {
    if (debug) { console.log(`** ${MODULE_NAME}: No UIC to be resolved, sending current configuration`); }
    sendSocketNotification(NOTIF_SET_CONFIG, effectiveConfiguration);
  }
}
