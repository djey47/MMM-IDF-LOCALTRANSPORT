/* @flow */

/* Timetable for Paris local transport Module */

/* Magic Mirror
 * Module: MMM-IDF-STIF-NAVITIA
 *
 * Based on script by da4throux
 * MIT Licensed.
 */

import {
 NOTIF_UPDATE,
 NOTIF_TRAFFIC,
 NOTIF_SET_CONFIG,
 NOTIF_VELIB,
 NOTIF_BUS,
} from './support/notifications';
import {
  renderWrapper,
  renderHeader,
  renderTraffic,
  renderVelib,
  renderNoInfoVelib,
} from './dom/renderer';

Module.register('MMM-IDF-STIF-NAVITIA',{

  // Define module defaults
  defaults: {
    maximumEntries: 2, //if the APIs sends several results for the incoming transport how many should be displayed
    maxTimeOffset: 200, // Max time in the future for entries
    useRealtime: true,
    updateInterval: 1 * 60 * 1000, //time in ms between pulling request for new times (update request)
    animationSpeed: 2000,
    convertToWaitingTime: true, // messages received from API can be 'hh:mm' in that case convert it in the waiting time 'x mn'
    initialLoadDelay: 0, // start delay seconds.
    apiBase: 'https://api-ratp.pierre-grimaud.fr/v2/',
    apiBaseV3: 'https://api-ratp.pierre-grimaud.fr/v3/',
    maxLettersForDestination: 22, //will limit the length of the destination string
    concatenateArrivals: true, //if for a transport there is the same destination and several times, they will be displayed on one line
    showSecondsToNextUpdate: true,  // display a countdown to the next update pull (should I wait for a refresh before going ?)
    showLastUpdateTime: false,  //display the time when the last pulled occured (taste & color...)
    oldUpdateOpacity: 0.5, //when a displayed time age has reached a threshold their display turns darker (i.e. less reliable)
    oldThreshold: 0.1, //if (1+x) of the updateInterval has passed since the last refresh... then the oldUpdateOpacity is applied
    debug: false, //console.log more things to help debugging
    apiVelib: 'https://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel', // add &q=141111 to get info of that station
    velibGraphWidth: 400, //Height will follow
    apiAutolib: 'https://opendata.paris.fr/explore/dataset/stations_et_espaces_autolib_de_la_metropole_parisienne/api/', ///add '?q=' mais pas d'info temps réel... pour l'instant
    conversion: { "Trafic normal sur l'ensemble de la ligne." : 'Traffic OK'},
  },

  // Define required scripts.
  getStyles: function() {
    return [
      this.file('css/MMM-IDF-STIF-NAVITIA.css'),
      'font-awesome.css',
    ];
  },

  // Define start sequence.
  start: function() {
    Log.info('Starting module: ' + this.name);

    this.sendSocketNotification(NOTIF_SET_CONFIG, this.config);

    this.busSchedules = {};
    this.ratpTraffic = {};
    this.ratpTrafficLastUpdate = {};
    this.velibHistory = {};
    this.busLastUpdate = {};
    this.loaded = false;
    this.updateTimer = null;

    const updateCallback = (() => {
      this.caller = 'updateInterval';
      this.updateDom();
    }).bind(this);
    setInterval(updateCallback, 1000);
  },

  getHeader: function () {
    return renderHeader(this.data, this.config);
  },

  // Override dom generator.
  getDom: function() {
    const now = new Date();

    const wrapper = renderWrapper(this.loaded);
    const table = document.createElement('table');
    table.className = 'small';
    wrapper.appendChild(table);

    let stopIndex;
    let previousRow, previousDestination, previousMessage, row, comingBus;
    let firstCell, secondCell;
    for (var busIndex = 0; busIndex < this.config.busStations.length; busIndex++) {
      var firstLine = true;
      var stop = this.config.busStations[busIndex];
      switch (stop.type) {
        case 'traffic':
          table.appendChild(renderTraffic(stop, this.ratpTraffic, this.config));
          break;
        case 'bus':
        case 'metros':
        case 'tramways':
        case 'rers':
          stopIndex = `${stop.line.toString().toLowerCase()}/${stop.stations}/${stop.destination}`;
          var comingBuses = this.busSchedules[stopIndex] || [{message: 'N/A', destination: 'N/A'}];
          var comingBusLastUpdate = this.busLastUpdate[stopIndex];
          for (var comingIndex = 0; (comingIndex < this.config.maximumEntries) && (comingIndex < comingBuses.length); comingIndex++) {
            row = document.createElement('tr');
            comingBus = comingBuses[comingIndex];
            var busNameCell = document.createElement('td');
            busNameCell.className = 'align-right bright';
            if (firstLine) {
              busNameCell.innerHTML = stop.label || stop.line;
            } else {
              busNameCell.innerHTML = ' ';
            }
            row.appendChild(busNameCell);

            var busDestination = document.createElement('td');
            busDestination.innerHTML = comingBus.destination.substr(0, this.config.maxLettersForDestination);
            busDestination.className = 'align-left';
            row.appendChild(busDestination);

            var depCell = document.createElement('td');
            depCell.className = 'bright';
            if (!this.busSchedules[stopIndex]) {
              depCell.innerHTML = 'N/A ';
            } else {
              if (this.config.convertToWaitingTime && /^\d{1,2}[:][0-5][0-9]$/.test(comingBus.message)) {
                var transportTime = comingBus.message.split(':');
                var endDate = new Date(0, 0, 0, transportTime[0], transportTime[1]);
                var startDate = new Date(0, 0, 0, now.getHours(), now.getMinutes(), now.getSeconds());
                var waitingTime = endDate - startDate;
                if (startDate > endDate) {
                  waitingTime += 1000 * 60 * 60 * 24;
                }
                waitingTime = Math.floor(waitingTime / 1000 / 60);
                depCell.innerHTML = waitingTime + ' mn';
              } else {
                depCell.innerHTML = comingBus.message;
              }
            }
            depCell.innerHTML = depCell.innerHTML.substr(0, this.config.maxLettersForTime);
            row.appendChild(depCell);
            if ((new Date() - Date.parse(comingBusLastUpdate)) > (this.config.oldUpdateThreshold ? this.config.oldUpdateThreshold : (this.config.updateInterval * (1 + this.config.oldThreshold)) )) {
              busDestination.style.opacity = this.config.oldUpdateOpacity;
              depCell.style.opacity = this.config.oldUpdateOpacity;
            }
            if (this.config.concatenateArrivals && !firstLine && (comingBus.destination == previousDestination)) {
              previousMessage += ' / ' + comingBus.message;
              if (previousRow) {
                previousRow.getElementsByTagName('td')[2].innerHTML = previousMessage;
              }
            } else {
              table.appendChild(row);
              previousRow = row;
              previousMessage = comingBus.message;
              previousDestination = comingBus.destination;
            }
            firstLine = false;
          }
          break;
        case 'velib':
          table.appendChild(renderVelib(stop, this.velibHistory, this.config, now));
          break;
      }
    }
    return wrapper;
  },

  socketNotificationReceived: function(notification, payload) {
    const { debug } = this.config;
    this.caller = notification;
    switch (notification) {
      case NOTIF_BUS:
        this.busSchedules[payload.id] = payload.schedules;
        this.busLastUpdate[payload.id] = payload.lastUpdate;
        this.loaded = true;
        this.updateDom();
        break;
      case NOTIF_VELIB:
        if (!this.velibHistory[payload.id]) {
          this.velibHistory[payload.id] = localStorage[payload.id] ? JSON.parse(localStorage[payload.id]) : [];
          this.velibHistory[payload.id].push(payload);
          localStorage[payload.id] = JSON.stringify(this.velibHistory[payload.id]);
          if (debug) {console.log (' *** size of velib History for ' + payload.id + ' is: ' + this.velibHistory[payload.id].length);}
          this.updateDom();
        } else if (this.velibHistory[payload.id][this.velibHistory[payload.id].length - 1].lastUpdate != payload.lastUpdate) {
          this.velibHistory[payload.id].push(payload);
          localStorage[payload.id] = JSON.stringify(this.velibHistory[payload.id]);
          this.updateDom();
          if (debug) {
            console.log (' *** size of velib History for ' + payload.id + ' is: ' + this.velibHistory[payload.id].length);
            console.log (this.velibHistory[payload.id]);
          }
        } else {
          if (debug) {
            console.log(' *** redundant velib payload for ' + payload.id + ' with time ' + payload.lastUpdate + ' && ' + this.velibHistory[payload.id][this.velibHistory[payload.id].length - 1].lastUpdate);
          }
        }
        this.loaded = true;
        break;
      case NOTIF_TRAFFIC:
        if (debug) {
          console.log(' *** received traffic information for: ' + payload.id);
          console.log(payload);
        }
        this.ratpTraffic[payload.id] = payload;
        this.ratpTrafficLastUpdate[payload.id] = payload.lastUpdate;
        this.loaded = true;
        this.updateDom();
        break;
      case NOTIF_UPDATE:
        this.config.lastUpdate = payload.lastUpdate;
        this.updateDom();
        break;
    }
  },
});
