const axios = require('axios');
const NavitiaResponseProcessor = require('./navitia/ResponseProcessor.js');
const TransilienResponseProcessor = require('./transilien/ResponseProcessor.js');
const LegacyResponseProcessor = require('./legacy/ResponseProcessor.js');
const TrafficResponseProcessor = require('./traffic/ResponseProcessor.js');
const { getTransilienDepartUrl } = require ('../support/transilien');
const { getNavitiaStopSchedulesUrl } = require ('../support/navitia');
const {
  getTrafficUrl,
  getVelibUrl,
  getScheduleUrl,
} = require ('../support/legacyApi');
const {
  NOTIF_UPDATE,
  NOTIF_VELIB,
  NOTIF_SET_CONFIG,
} = require('../support/notifications.js');

/**
 * Custom NodeHelper implementation
 */
module.exports = {
  start: function () {
    this.started = false;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === NOTIF_SET_CONFIG && !this.started) {
      this.config = payload;

      if (this.config.debug) {
        console.log (' *** config set in node_helper: ');
        console.log ( payload );
      }

      this.started = true;
      this.scheduleUpdate(this.config.initialLoadDelay);
    }
  },

  /**
   * Schedule next update.
   * @param delay Milliseconds before next update. If empty, this.config.updateInterval is used.
  */
  scheduleUpdate: function(delay) {
    let nextLoad = this.config.updateInterval;
    if (typeof delay !== 'undefined' && delay >= 0) {
      nextLoad = delay;
    }
    clearTimeout(this.updateTimer);

    if (this.config.debug) {
      console.log (' *** scheduleUpdate set next update in ' + nextLoad);
    }

    this.updateTimer = setTimeout(this.updateTimetable.bind(this), nextLoad);
  },

  /**
   * @private
   */
  scheduleRetry: function() {
    if (this.loaded) {
      this.scheduleUpdate();
    } else {
      this.scheduleUpdate(this.retryDelay);
    }
  },

  /**
   * Extracts reponse body if available, otherwise handles retries
   * @param url requested URL
   * @param processFunction callback to send extracted data to
   * @param response API response
   * @private
   */
  handleAPIResponse: function(url, processFunction, response) {
    const { debug } = this.config;
    if (response && response.data) {
      const { data } = response;

      if (debug) {
        console.log (` *** received answer for: ${url}`);
        console.log (data);
      }

      processFunction(data, this);
    } else {

      if (debug) {
        if (response) {
          console.log (' *** partial response received');
          console.log (response);
        } else {
          console.log (' *** no response received');
        }
      }
    
    }

    this.scheduleRetry();
  },

  /**
   * When API error occurs, do particular processing and handle retries
   * @private
   */
  handleAPIError: function(error) {
    console.error(error);

    this.scheduleRetry();
  },

  /**
   * Calls API and handles response via callback
   * @param url requested URL
   * @param processFunction callback to send extracted data to
   * @param authToken (optional) authentication token
   * @private
   */
  getResponse: function(url, processFunction, authToken = '') {
    const { debug } = this.config.debug;
    const config = {
      headers: {
        Accept: 'application/json;charset=utf-8',
        Authorization: authToken,
      },
    };

    if (debug) console.log (` *** fetching: ${url}`);

    axios.get(url, config)
      .then((response => this.handleAPIResponse(url, processFunction, response)).bind(this))
      .catch((error => this.handleAPIError(error)).bind(this));
  },

  /* updateTimetable(transports)
   * Calls corresponding process function on successful response.
  */
  updateTimetable: function() {
    const { debug, stations, apiBaseV3, apiVelib, apiNavitia, apiTransilien, navitiaToken, transilienToken } = this.config;
    
    if (debug) console.log (' *** fetching update');
    
    this.sendSocketNotification(NOTIF_UPDATE, { lastUpdate : new Date()});

    stations.forEach((stopConfig) => {
      const { type } = stopConfig;
      switch (type) {
        case 'tramways':
        case 'bus':
        case 'rers':
        case 'metros':
          this.getResponse(
            getScheduleUrl(apiBaseV3, stopConfig),
            LegacyResponseProcessor.processTransport);
          break;
        case 'velib':
          this.getResponse(
            getVelibUrl(apiVelib, stopConfig),
            this.processVelib);
          break;
        case 'traffic':
          this.getResponse(
            getTrafficUrl(apiBaseV3, stopConfig),
            TrafficResponseProcessor.processTraffic);
          break;
        case 'transiliensNavitia':
          this.getResponse(
            getNavitiaStopSchedulesUrl(apiNavitia, stopConfig),
            NavitiaResponseProcessor.processTransportNavitia,
            navitiaToken,
          );
          break;        
        case 'transiliens':
          this.getResponse(
            getTransilienDepartUrl(apiTransilien, stopConfig),
            TransilienResponseProcessor.processTransportTransilien,
            transilienToken,
          );
          break;        
        default:
          if (debug) console.log(` *** unknown request: ${type}`);
      }
    });
  },

  processVelib: (data, context) => {
    const { number, name, bike_stands, available_bike_stands, available_bikes, last_update } = data.records[0].fields;
    const velibInfo = {
      id: number,
      name,
      total: bike_stands,
      empty: available_bike_stands,
      bike: available_bikes,
      last_update: last_update,
      loaded: true,
    };
    context.sendSocketNotification(NOTIF_VELIB, velibInfo);
  },
};
