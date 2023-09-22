/* @flow */

import { resolveRefData } from './railwayRepository';
import { NOTIF_SET_CONFIG } from './notifications';

import type { ModuleConfiguration } from '../types/Configuration';
import type { RefDataQuery } from '../types/Transport';

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
  apiTransilien: 'https://prim.iledefrance-mobilites.fr/marketplace/',
  apiVelib: 'https://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel',
  apiAutolib: 'https://opendata.paris.fr/explore/dataset/stations_et_espaces_autolib_de_la_metropole_parisienne/api/',
  apiCitymapper: 'https://citymapper.com/api/1/',
  transilienToken: '',
  citymapperToken: '00000000000000000000000000000000',
  messages: {
    ago: 'ago',
    loading: 'Loading connections ...',
    notYet: 'no info yet',
    nextUpdate: 'updated every',
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
  apiCitymapper: 'http://localhost:8088/citymapper/',
  apiVelib: 'http://localhost:8088/velib/',
  apiAutolib: 'http://localhost:8088/autolib/',  
};

/**
 * Resolves useful information from module configuration (station, lines ID ...)
 * Sends configuration to server-side via sockets.
 * @param {Object} configuration configuration to be enhanced
 * @param {Function} sendSocketNotification callback to notification handler
 */
export function enhanceConfiguration(configuration: ModuleConfiguration, sendSocketNotification: (notification: string, payload: Object) => void) {
  const { devMode } = configuration;

  // Overrides API endpoints in development mode
  const effectiveConfiguration = devMode ? { ...configuration, ...devDefaults } : { ...configuration };

  // Stations for transilien: retrieve IDs
  effectiveConfiguration.stations
    .filter(stationConfig => stationConfig.type === TYPE_TRANSILIEN)
    .filter(stationConfig => {
      // Do not resolve to identifiers if already provided
      const { destination, transilienRefData } = stationConfig;      
      return !transilienRefData || !transilienRefData.lineRef || !transilienRefData.stopAreaRef || destination && !transilienRefData.destinationRef;
    })
    .forEach((stationConfig)  => {
      const { station, destination, line } = stationConfig;
      
      if(!station) {
        console.error(`** ${MODULE_NAME}: Configuration does not contain station:`);
        console.error(stationConfig);
      } else {
        const query: RefDataQuery = {
          lineValue: typeof line === 'string' ? line : '?',
          stationValue: station || '?',
          destinationValue: destination,
        };
        const allRefData = resolveRefData(query);
        stationConfig.transilienRefData = {
          destinationRef: allRefData.destinationRef || '',
          lineRef: allRefData.lineRef || '',
          stopAreaRef: allRefData.stopAreaRef || '',
        };
      }
    });
  
  sendSocketNotification(NOTIF_SET_CONFIG, effectiveConfiguration);
}
