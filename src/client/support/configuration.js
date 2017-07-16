/* @flow */

import { getAllStationInfo } from '../../support/railwayRepository';
import { NOTIF_SET_CONFIG } from '../../support/notifications';

import type { ModuleConfiguration } from '../../types/Configuration';

const TYPE_TRANSILIEN = 'transiliens';

export const defaults: ModuleConfiguration = {
  maximumEntries: 2,
  maxTimeOffset: 200,
  useRealtime: true,
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
  conversion: { "Trafic normal sur l'ensemble de la ligne." : 'Traffic OK'},

  apiBaseV3: 'https://api-ratp.pierre-grimaud.fr/v3/',
  apiNavitia: 'https://api.navitia.io/v1/',
  apiTransilien: 'http://api.transilien.com/',
  navitiaToken: '00000000-0000-0000-000000000000',
  transilienToken: 'Basic',
  apiVelib: 'https://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel',
  apiAutolib: 'https://opendata.paris.fr/explore/dataset/stations_et_espaces_autolib_de_la_metropole_parisienne/api/',
  apiSncfData: 'https://ressources.data.sncf.com/api/records/1.0/',
  messages: {
    status: {
      approaching: 'Approaching',
    },
    units: {
      minutes: 'mn',
    },
  },

  stations: [],
};

/**
 * 
 * 
 * @export
 * @param {Array<Object>} responses 
 * @param {Function} sendSocketNotification 
 * @param {Object} configuration 
 */
export function handleStationInfoResponse(responses: Array<Object>, sendSocketNotification: Function, configuration: ModuleConfiguration) {
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

    if (debug) {
      console.log('** Resolved UIC codes:');
      console.log(configuration.stations[index].uic);
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
export function enhanceConfiguration(configuration: ModuleConfiguration, sendSocketNotification: Function) {
  // Stations for transilien: retrieve UIC
  const queries = configuration.stations
    .filter(stationConfig => stationConfig.type === TYPE_TRANSILIEN)
    .map((stationConfig, index) => {
      const { station, destination } = stationConfig;
      return {
        index,
        stationValue: station,
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
