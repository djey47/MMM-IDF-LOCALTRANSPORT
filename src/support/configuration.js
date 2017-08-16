/* @flow */

import { getAllStationInfo } from './railwayRepository';
import { NOTIF_SET_CONFIG } from './notifications';

import type { NotificationSenderFunction } from '../types/Application';
import type { ModuleConfiguration } from '../types/Configuration';
import type { StationInfoResult } from '../types/Transport';

const TYPE_TRANSILIEN = 'transiliens';

export const defaults: ModuleConfiguration = {
  maximumEntries: 2,
  maxTimeOffset: 200,
  updateInterval: 1 * 60 * 1000,
  animationSpeed: 2000,
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

  apiBaseV3: 'https://api-ratp.pierre-grimaud.fr/v3/',
  apiNavitia: 'https://api.navitia.io/v1/',
  apiTransilien: 'http://api.transilien.com/',
  apiVelib: 'https://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel',
  apiAutolib: 'https://opendata.paris.fr/explore/dataset/stations_et_espaces_autolib_de_la_metropole_parisienne/api/',
  apiSncfData: 'https://ressources.data.sncf.com/api/records/1.0/',
  apiSncfNavitia: 'https://api.sncf.com/v1/coverage/sncf/',
  apiCitymapper: 'https://citymapper.com/api/1/',
  transilienToken: 'Basic',
  navitiaToken: '00000000-0000-0000-000000000000',
  sncfNavitiaToken: '00000000-0000-0000-000000000000',
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
      console.log('** MMM-IDF-STIF-NAVITIA: Configuration resolved UIC codes:');
      console.log(`station: ${station || '/'} => ${uic.station || '/'} , destination: ${destination || '/'} => ${uic.destination || '/'}`);
    } else {
      console.error('** MMM-IDF-STIF-NAVITIA: Configuration resolved no UIC codes:');      
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
        console.error('** MMM-IDF-STIF-NAVITIA: Configuration does not contain station:');
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
