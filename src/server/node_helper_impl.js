const unirest = require('unirest');

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

  getResponse: function(_url, _processFunction) {
    if (this.config.debug) console.log (` *** fetching: ${_url}`);

    const context = this;
    unirest.get(_url)
      .header({
        'Accept': 'application/json;charset=utf-8',
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
          this.getResponse(url, this.processTransport, stopConfig);
          break;
        case 'velib':
          url = `${apiVelib}&q=${station}`;
          this.getResponse(url, this.processVelib, stopConfig);
          break;
        case 'traffic':
          url = `${apiBaseV3}traffic/${line[0]}/${line[1]}`;
          this.getResponse(url, this.processTraffic, stopConfig);
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
    context.sendSocketNotification('VELIB', velibInfo);
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
    context.sendSocketNotification('TRANSPORT', schedule);
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
    context.sendSocketNotification('TRAFFIC', result);
  },
};
