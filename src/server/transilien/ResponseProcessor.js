const ResponseProcessor = {
  /**
   * @private
   */
  dataToSchedule: function(data) {
    return data;
  },

  /**
   * Handles Transilien realtime response
   * 
   * @param {any} data 
   * @param {any} context 
   */
  processTransportTransilien: function(data, context) {
    if (context.debug) {
      console.log (' *** processTransportTransilien data');
      console.log (data);
    }

    context.loaded = true;
    context.sendSocketNotification('TRANSPORT', ResponseProcessor.dataToSchedule(data));
  },
};

module.exports = ResponseProcessor;
