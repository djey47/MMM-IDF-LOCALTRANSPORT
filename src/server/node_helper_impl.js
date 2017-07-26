const axios = require('axios');
const NavitiaResponseProcessor = require('./navitia/ResponseProcessor.js');
const TransilienResponseProcessor = require('./transilien/ResponseProcessor.js');
const LegacyResponseProcessor = require('./legacy/ResponseProcessor.js');
const TrafficResponseProcessor = require('./traffic/ResponseProcessor.js');
const VelibResponseProcessor = require('./velib/ResponseProcessor.js');
const { getTransilienDepartUrl } = require ('../support/transilien');
const { getNavitiaStopSchedulesUrl } = require ('../support/navitia');
const {
  getTrafficUrl,
  getVelibUrl,
  getScheduleUrl,
} = require ('../support/legacyApi');
const {
  NOTIF_UPDATE,
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
   * @param stopConfig associated stop configuration
   * @private
   */
  handleAPIResponse: function(url, processFunction, response, stopConfig) {
    const { debug } = this.config;
    if (response && response.data) {
      const { data } = response;

      if (debug) {
        console.log (` *** received answer for: ${url}`);
        console.log (data);
        console.log (stopConfig);
      }

      processFunction(data, this, stopConfig);
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
  getResponse: function(url, processFunction, authToken, stopConfig) {
    const { debug } = this.config.debug;
    const headers = {
      Accept: 'application/json;charset=utf-8',
    };
    if (authToken) {
      headers.Authorization = authToken;
    }

    if (debug) console.log (` *** fetching: ${url}`);

    axios.get(url, { headers })
      .then((response => this.handleAPIResponse(url, processFunction, response, stopConfig)).bind(this))
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
            VelibResponseProcessor.processVelib);
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
            stopConfig,
          );
          break;        
        default:
          if (debug) console.log(` *** unknown request: ${type}`);
      }
    });
  },
};
