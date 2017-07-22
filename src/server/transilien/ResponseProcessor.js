const moment = require('moment-timezone');
const { NOTIF_TRANSPORT } = require('../../support/notifications.js');
const xmlToJson = require('../../support/xml.js');
const { createIndexFromResponse } = require('../../support/transilien.js'); 
const { getAllStationInfo } = require('../../support/railwayRepository');

const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm';

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
  // TODO status should be a code
  getStatus: function(train) {
    const { miss, etat } = train;
    return `${miss} ${etat ? etat : ''}`.trim();
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
        const { date: {_}, term } = t;
        if (!destination || term === destination) {
          // Accept train matching wanted destination, if specified
          return {
            destination: stationInfos[index].stationInfo.libelle,
            status: ResponseProcessor.getStatus(t),
            time: moment(_, DATE_TIME_FORMAT).toISOString(),
          };        
        }

        // Reject train not matching wanted destination
        return null;
      })
      .filter(schedule => !!schedule);

    return {
      id: createIndexFromResponse(data),
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
