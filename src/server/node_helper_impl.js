const axios = require('axios');
const NavitiaResponseProcessor = require('./navitia/ResponseProcessor.js');
const TransilienResponseProcessor = require('./transilien/ResponseProcessor.js');
const {
  NOTIF_UPDATE,
  NOTIF_TRAFFIC,
  NOTIF_VELIB,
  NOTIF_TRANSPORT,
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

    // Schedule retry
    if (this.loaded) {
      this.scheduleUpdate();
    } else {
      this.scheduleUpdate(this.retryDelay);
    }
  },

  /**
   * Calls API and handles response via callback
   * @param url requested URL
   * @param processFunction callback to send extracted data to
   * @param authToken optional authentication token
   * @private
   */
  getResponse: function(url, processFunction, authToken) {
    const { debug } = this.config.debug;
    const config = {
      headers: {
        Accept: 'application/json;charset=utf-8',
        Authorization: authToken || '',
      },
    };

    if (debug) console.log (` *** fetching: ${url}`);

    axios.get(url, config )
      .then(function(response) {
        this.handleAPIResponse(url, processFunction, response);
      }.bind(this));
  },

  /* updateTimetable(transports)
   * Calls corresponding process function on successful response.
  */
  updateTimetable: function() {
    const { debug, stations, apiBaseV3, apiVelib, apiNavitia, apiTransilien, navitiaToken, transilienToken } = this.config;
    if (debug) {
      console.log (' *** fetching update');
    }
    
    this.sendSocketNotification(NOTIF_UPDATE, { lastUpdate : new Date()});

    stations.forEach((stopConfig) => {
      let url;
      const { type, line, station, destination } = stopConfig;
      switch (type) {
        case 'tramways':
        case 'bus':
        case 'rers':
        case 'metros':
          url = `${apiBaseV3}schedules/${type}/${line.toString().toLowerCase()}/${station}/${destination}`;
          this.getResponse(url, this.processTransport);
          break;
        case 'velib':
          url = `${apiVelib}&q=${station}`;
          this.getResponse(url, this.processVelib);
          break;
        case 'traffic':
          url = `${apiBaseV3}traffic/${line[0]}/${line[1]}`;
          this.getResponse(url, this.processTraffic);
          break;
        case 'transiliensNavitia':
          url = `${apiNavitia}coverage/fr-idf/physical_modes/physical_mode:RapidTransit/stop_areas/stop_area:${station}/lines/line:${line}/stop_schedules`;
          this.getResponse(url, NavitiaResponseProcessor.processTransportNavitia, navitiaToken);
          break;        
        case 'transiliens':
          url = `${apiTransilien}gare/${station}/depart`;
          this.getResponse(url, TransilienResponseProcessor.processTransportTransilien, transilienToken);
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

  processTransport: (data, context) => {
    if (context.debug) {
      console.log (' *** processTransport data');
      console.log (data);
    }
    
    const id = data._metadata.call.split('/').slice(-3).join('/');
    const schedule = {
      id,
      schedules: data.result.schedules,
      lastUpdate: new Date(),
    };
    context.loaded = true;
    context.sendSocketNotification(NOTIF_TRANSPORT, schedule);
  },

  processTraffic: (data, context) => {
    if (context.config.debug) {
      console.log('response receive: ');
      console.log(data.result); //line, title, message
      console.log('___');
    }

    const id = data._metadata.call.split('/').slice(-3).join('/').toLowerCase();
    const result = {};
    Object.assign(result, data.result, {
      id,
      lastUpdate: new Date(),
      loaded: true,
    });
    context.sendSocketNotification(NOTIF_TRAFFIC, result);
  },
};
