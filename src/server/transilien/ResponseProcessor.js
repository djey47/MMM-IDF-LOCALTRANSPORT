const { NOTIF_TRANSPORT } = require('../../support/notifications.js');
const xmlToJson = require('../../support/xml.js');
const { createIndexFromResponse } = require('../../support/transilien.js'); 
const { getAllStationInfo } = require('../../support/railwayRepository'); 

const ResponseProcessor = {
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

    // TODO use date object instead of label, formatting will be client side
    // TODO use raw field for date, message will be reserved for status
    const schedules = train
      .map(({ date }, index) => ({
        destination: stationInfos[index].stationInfo.libelle,
        message: date._,
      }));

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
