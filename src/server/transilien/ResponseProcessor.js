const moment = require('moment-timezone');
const { NOTIF_TRANSPORT } = require('../../support/notifications.js');
const xmlToJson = require('../../support/xml.js');
const { createIndexFromResponse } = require('../../support/transilien.js'); 
const { getAllStationInfo } = require('../../support/railwayRepository.js');
const { Status: {
  ON_TIME,
  DELAYED,
  DELETED,
  UNKNOWN,
}} = require('../../support/status.js');

const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm';

const statuses = {
  'Retardé': DELAYED,
  'Supprimé': DELETED,
};

const ResponseProcessor = {
  /**
   * @private
   */
  now: function() {
    return moment();
  },
 
  /**
   * @private
   */
  getStatus: function(etat) {
    if (!etat) return ON_TIME;
    return statuses[etat] || UNKNOWN;
  },

  /**
   * @private
   */
  passagesToInfoQueries: function(passages) {
    if (!passages) return [];

    return passages.train
      .map(({ term }, index) => ({
        index,
        stationValue: term,
      }));    
  },

  /**
   * @private
   */
  dataToSchedule: function(data, stopConfig, stationInfos) {
    if (!data.passages) return {};

    const { uic: { destination } } = stopConfig;
    const { passages: {train} } = data;    
    const schedules = train
      .map((t, index) => {
        const { date: {_}, term, miss, etat } = t;
        if (!destination || term === destination) {
          // Accept train matching wanted destination, if specified
          return {
            destination: stationInfos[index].stationInfo.libelle,
            status: ResponseProcessor.getStatus(etat),
            time: moment(_, DATE_TIME_FORMAT).toISOString(),
            code: miss,
          };        
        }

        // Reject train not matching wanted destination
        return null;
      })
      .filter(schedule => !!schedule)
      .sort((schedule1, schedule2) => {
        const firstCriteria = schedule1.destination.localeCompare(schedule2.destination);
        if (firstCriteria === 0) {
          const moment1 = moment(schedule1.time);
          const moment2 = moment(schedule2.time);
          return moment1.isBefore(moment2) ? -1 : 1; 
        }
        return firstCriteria;
      });

    return {
      id: createIndexFromResponse(data, destination),
      lastUpdate: ResponseProcessor.now().toDate(),
      schedules,
    };
  },

  /**
   * Handles Transilien realtime response
   * 
   * @param {string} xmlData data received from Transilien XML API
   * @param {Object} context whole module context
   * @param {Object} stopConfig associated stop configuration
   */
  processTransportTransilien: function(xmlData, context, stopConfig) {
    const { config, config: { debug } } = context;
    const data = xmlToJson(xmlData);

    if (debug) {
      console.log (' *** processTransportTransilien XML data');
      console.log (xmlData);
      console.log (' *** processTransportTransilien JSON data');
      console.log (data);
    }

    getAllStationInfo(ResponseProcessor.passagesToInfoQueries(data.passages), config)
      .then(stationInfos => {
        context.loaded = true;
        context.sendSocketNotification(NOTIF_TRANSPORT, ResponseProcessor.dataToSchedule(data, stopConfig, stationInfos));
      })
      .catch(error => console.error(error));
  },
};

module.exports = ResponseProcessor;
