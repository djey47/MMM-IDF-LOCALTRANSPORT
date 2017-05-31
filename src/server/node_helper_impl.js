const unirest = require('unirest');

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
    const self = this;
    clearTimeout(this.updateTimer);
    if (this.config.debug) { console.log (' *** scheduleUpdate set next update in ' + nextLoad);}
    this.updateTimer = setTimeout(function() {
      self.updateTimetable();
    }, nextLoad);
  },

  getResponse: function(_url, _processFunction) {
    var self = this;
    var retry = true;
    if (this.config.debug) console.log (` *** fetching: ${_url}`);
    unirest.get(_url)
      .header({
        'Accept': 'application/json;charset=utf-8',
      })
      .end(function(response){
        if (response && response.body) {
          if (self.config.debug) {
            console.log (` *** received answer for: ${_url}`);
            console.log (response.body);
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
          self.scheduleUpdate(self.loaded ? -1 : this.config.retryDelay);
        }
      });
  },

  /* updateTimetable(transports)
   * Calls processTrains on successful response.
  */
  updateTimetable: function() {
    const { debug, stations, apiBaseV3, apiVelib } = this.config;
    if (debug) { console.log (' *** fetching update');}
    this.sendSocketNotification('UPDATE', { lastUpdate : new Date()});

    stations.forEach((stopConfig) => {
      let url;
      const { type, line, station, destination } = stopConfig;
      switch (type) {
        case 'tramways':
        case 'bus':
        case 'rers':
        case 'metros':
          url = `${apiBaseV3}schedules/${type}/${line.toString().toLowerCase()}/${station}/${destination}`;
          this.getResponse(url, this.processTransport.bind(this), stopConfig);
          break;
        case 'velib':
          url = `${apiVelib}&q=${station}`;
          this.getResponse(url, this.processVelib.bind(this), stopConfig);
          break;
        case 'traffic':
          url = `${apiBaseV3}traffic/${line[0]}/${line[1]}`;
          this.getResponse(url, this.processTraffic.bind(this), stopConfig);
          break;
        default:
          if (debug) {
            console.log(` *** unknown request: ${type}`);
          }
      }
    });
  },

  processVelib: function(data) {
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
    this.sendSocketNotification('VELIB', velibInfo);
  },

  processTransport: function(data) {
    if (this.config.debug) {
      console.log (' *** processTransport data');
      console.log (data);
    }
    
    const id = data._metadata.call.split('/').slice(-3).join('/');
    const schedule = {
      id,
      schedules: data.result.schedules,
      lastUpdate: new Date(),
    };
    this.loaded = true;
    this.sendSocketNotification('TRANSPORT', schedule);
  },

  processTraffic: function (data) {
    if (this.config.debug) {
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
    this.sendSocketNotification('TRAFFIC', result);
  },
};
