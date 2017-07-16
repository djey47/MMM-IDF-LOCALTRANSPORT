const moment = require('moment');
const { NOTIF_TRANSPORT } = require('../../support/notifications.js');
const xmlToJson = require('../../support/xml.js');
const { createIndexFromResponse } = require('../../support/transilien.js'); 
const { getAllStationInfo } = require('../../support/railwayRepository');


const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm';

const ResponseProcessor = {
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
  dataToSchedule: function(data, stationInfos) {
    if (!data.passages) return {};

    const {passages: {train}} = data;    
    const schedules = train
      .map((t, index) => {
        const { date: {_} } = t;
        return {
          destination: stationInfos[index].stationInfo.libelle,
          status: ResponseProcessor.getStatus(t),
          time: moment(_, DATE_TIME_FORMAT).toISOString(),
        };
      });

    return {
      id: createIndexFromResponse(data),
      lastUpdate: new Date(),
      schedules,
    };
  },

  /**
   * Handles Transilien realtime response
   * 
   * @param {any} xmlData 
   * @param {any} context 
   */
  processTransportTransilien: function(xmlData, context) {
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
        context.sendSocketNotification(NOTIF_TRANSPORT, ResponseProcessor.dataToSchedule(data, stationInfos));
      })
      .catch(error => console.error(error));
  },
};

module.exports = ResponseProcessor;
