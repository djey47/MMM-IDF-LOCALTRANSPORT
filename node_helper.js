/* @flow */

/* Magic Mirror
 * Module: MMM-IDF-STIF-NAVITIA
 *
 * based on a Script from from da4throux
 * MIT Licensed.
 */

// $FlowFixMe
const NodeHelper = require('node_helper');
const unirest = require('unirest');

module.exports = NodeHelper.create({
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
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== 'undefined' && delay >= 0) {
      nextLoad = delay;
    }
    var self = this;
    clearTimeout(this.updateTimer);
    if (this.config.debug) { console.log (' *** scheduleUpdate set next update in ' + nextLoad);}
    this.updateTimer = setTimeout(function() {
      self.updateTimetable();
    }, nextLoad);
  },

  getResponse: function(_url, _processFunction, _stopConfig) {
    var self = this;
    var retry = true;
    if (this.config.debug) { console.log (' *** fetching: ' + _url);}
    unirest.get(_url)
      .header({
        'Accept': 'application/json;charset=utf-8',
      })
      .end(function(response){
        if (response && response.body) {
          if (self.config.debug) {
            console.log (' *** received answer for: ' + _url);
            console.log (_stopConfig);
          }
          _processFunction(response.body);
        } else {
          if (self.config.debug) {
            if (response) {
              console.log (' *** partial response received');
              console.log (response);
            } else {
              console.log (' *** no response received');
            }
          }
        }
        if (retry) {
          self.scheduleUpdate((self.loaded) ? -1 : this.config.retryDelay);
        }
      });
  },

  /* updateTimetable(transports)
   * Calls processTrains on successful response.
  */
  updateTimetable: function() {
    var url, stopConfig;
    const { debug, busStations, apiBase, apiBaseV3, apiVelib } = this.config;
    if (debug) { console.log (' *** fetching update');}
    this.sendSocketNotification('UPDATE', { lastUpdate : new Date()});

    for (var index in busStations) {
      stopConfig = busStations[index];
      const { api, type, line, stations, destination } = stopConfig;
      switch (type) {
        case 'tramways':
        case 'bus':
        case 'rers':
        case 'metros':
          if (api == 'v3') {
            url = apiBaseV3 + 'schedules/' + type + '/' + line.toString().toLowerCase() + '/' + stations + '/' + destination; // get schedule for that bus
          } else {
            url = apiBase + type + '/' + line.toString().toLowerCase() + '/stations/' + stations + '?destination=' + destination; // get schedule for that bus
          }
          this.getResponse(url, this.processBus.bind(this), stopConfig);
          break;
        case 'velib':
          url = apiVelib + '&q=' + stations;
          this.getResponse(url, this.processVelib.bind(this));
          break;
        case 'traffic':
          if (api == 'v3') {
            url = apiBaseV3 + 'traffic/' + line[0] + '/' + line[1];
            this.getResponse(url, this.processTraffic.bind(this), stopConfig);
          } else {
            if (debug) {
              console.log(' *** API version not handled for: ' + type + ' type, version: ' + api);
            }
          }
          break;
        default:
          if (debug) {
            console.log(' *** unknown request: ' + type);
          }
      }
    }
  },

  processVelib: function(data) {
    this.velib = {};
    //fields: {"status": "OPEN", "contract_name": "Paris", "name": "14111 - DENFERT-ROCHEREAU CASSINI",
    //"bonus": "False", "bike_stands": 24, "number": 14111, "last_update": "2017-04-15T12:14:25+00:00",
    //"available_bike_stands": 24, "banking": "True", "available_bikes": 0, "address": "18 RUE CASSINI - 75014 PARIS",
    //"position": [48.8375492922, 2.33598303047]}
    var record = data.records[0].fields;
    this.velib.id = record.number;
    this.velib.name = record.name;
    this.velib.total = record.bike_stands;
    this.velib.empty = record.available_bike_stands;
    this.velib.bike = record.available_bikes;
    this.velib.lastUpdate = record.last_update;
    this.velib.loaded = true;
    this.sendSocketNotification('VELIB', this.velib);
  },

  processBus: function(data) {
    var idMaker;
    if (this.config.debug) { console.log (' *** processBus data'); console.log (data); }
    this.schedule = {};
    if (data.response) {
      idMaker = data.response.informations;
      this.schedule.id = idMaker.line.toString().toLowerCase() + '/' + (idMaker.station.id_station || idMaker.station.id) + '/' + (idMaker.destination.id_destination || idMaker.destination.id);
    } else {
      idMaker = data._metadata.call.split('/');
      this.schedule.id = idMaker[idMaker.length - 3] + '/' + idMaker[idMaker.length - 2] + '/' + idMaker[idMaker.length - 1];
    }
    this.schedule.schedules = data.response ? data.response.schedules : data.result.schedules;
    this.schedule.lastUpdate = new Date();
    this.loaded = true;
    this.sendSocketNotification('BUS', this.schedule);
  },

  processTraffic: function (data) {
    var result, idMaker;
    if (this.config.debug) {
      console.log('response receive: ');
      console.log(data.result); //line, title, message
      console.log('___');
    }
    result = {};
    if (data.result) {
      result = data.result;
      idMaker = data._metadata.call.split('/');
    }
    if (idMaker) {
      result.id = idMaker[idMaker.length - 3].toString().toLowerCase() + '/' + idMaker[idMaker.length - 2].toString().toLowerCase() + '/' + idMaker[idMaker.length - 1].toString().toLowerCase();
    }
    result.lastUpdate = new Date();
    result.loaded = true;
    this.sendSocketNotification('TRAFFIC', result);
  },
});
