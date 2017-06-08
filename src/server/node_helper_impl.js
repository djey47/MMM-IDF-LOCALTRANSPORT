const unirest = require('unirest');
const NavitiaResponseProcessor = require('./navitia/ResponseProcessor.js');
const {
 NOTIF_UPDATE,
 NOTIF_TRAFFIC,
 NOTIF_VELIB,
 NOTIF_TRANSPORT,
} = require('../support/notifications.js');
/**
 * Custom NodeHelper implementation
 */
module.exports = {
  start: function () {
    this.started = false;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === 'SET_CONFIG' && !this.started) {
      this.config = payload;

      if (this.config.debug) {
        console.log (' *** config set in node_helper: ');
        console.log ( payload );
      }

      this.started = true;
      this.scheduleUpdate(this.config.initialLoadDelay);
    }
  },

  /* scheduleUpdate()
   * Schedule next update.
   * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
  */
  scheduleUpdate: function(delay) {
    let nextLoad = this.config.updateInterval;
    if (typeof delay !== 'undefined' && delay >= 0) {
      nextLoad = delay;
    }
    clearTimeout(this.updateTimer);

    if (this.config.debug) console.log (' *** scheduleUpdate set next update in ' + nextLoad);

    const updateCallback = function() {
      this.updateTimetable();
    }.bind(this);
    this.updateTimer = setTimeout(updateCallback, nextLoad);
  },

  getResponse: function(_url, _processFunction, authToken) {
    if (this.config.debug) console.log (` *** fetching: ${_url}`);

    const context = this;
    unirest.get(_url)
      .header({
        'Accept': 'application/json;charset=utf-8',
        'Authorization': authToken || '',
      })
      .end(function(response) {
        const { debug, retryDelay } = context.config;
        let retry = false;
        if (response && response.body) {

          if (debug) {
            console.log (` *** received answer for: ${_url}`);
            console.log (response.body);
          }

          _processFunction(response.body, context);
        } else {

          if (debug) {
            if (response) {
              console.log (' *** partial response received');
              console.log (response);
            } else {
              console.log (' *** no response received');
            }
          }

          retry = true;
        }
        if (retry) {
          context.scheduleUpdate(context.loaded ? -1 : retryDelay);
        }
      });
  },

  /* updateTimetable(transports)
   * Calls corresponding process function on successful response.
  */
  updateTimetable: function() {
    const { debug, stations, apiBaseV3, apiVelib, apiNavitia, navitiaToken } = this.config;
    
    if (debug) { console.log (' *** fetching update');}
    
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
        case 'transiliens':
          url = `${apiNavitia}coverage/fr-idf/physical_modes/physical_mode:RapidTransit/stop_areas/stop_area:${station}/lines/line:${line}/stop_schedules`;
          this.getResponse(url, NavitiaResponseProcessor.processTransportNavitia, navitiaToken);
          break;        
        default:

          if (debug) {
            console.log(` *** unknown request: ${type}`);
          }

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
