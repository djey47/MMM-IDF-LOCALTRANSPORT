/* @flow */

/* Timetable for Paris local transport Module */

/* Magic Mirror
 * Module: MMM-IDF-STIF-NAVITIA
 *
 * Based on script by da4throux
 * MIT Licensed.
 */

import moment from 'moment-timezone';
import classnames from 'classnames';
import {
  NOTIF_UPDATE,
  NOTIF_TRAFFIC,
  NOTIF_VELIB,
  NOTIF_TRANSPORT,
} from '../support/notifications';
import { defaults, enhanceConfiguration } from '../support/configuration';
import {
  renderWrapper,
  renderHeader,
  renderTraffic,
  renderPublicTransportLegacy,
  renderPublicTransportNavitia,
  renderPublicTransportTransilien,
  renderVelib,
} from './dom/renderer';

Module.register('MMM-IDF-STIF-NAVITIA',{
  // Define module defaults
  defaults,

  // Define required scripts.
  getStyles: function(): Array<string> {
    return [
      this.file('css/MMM-IDF-STIF-NAVITIA.css'),
      'font-awesome.css',
    ];
  },

  // Define start sequence.
  start: function(): void {
    Log.info('Starting module: ' + this.name);

    enhanceConfiguration(this.config, this.sendSocketNotification.bind(this));

    this.transportSchedules = {};
    this.transportLastUpdate = {};
    this.ratpTraffic = {};
    this.ratpTrafficLastUpdate = {};
    this.velibHistory = {};
    this.loaded = false;
    this.updateTimer = null;

    const updateCallback = (() => {
      this.caller = 'updateInterval';
      this.updateDom();
    }).bind(this);
    setInterval(updateCallback, 1000);
  },

  // What's being written on top
  getHeader: function (): string {
    return renderHeader(this.data, this.config);
  },

  // Override dom generator.
  getDom: function(): any {
    const { messages, stations } = this.config;
    const wrapper = renderWrapper(this.loaded, messages);
    const table = document.createElement('table');
    table.className = classnames('Schedules', 'small');
    wrapper.appendChild(table);

    // TODO use key generator as callback and use single renderer method
    // TODO use table node as parameter and add children in renderer
    stations.forEach((stop) => {
      switch (stop.type) {
        case 'traffic':
          table.appendChild(renderTraffic(stop, this.ratpTraffic, this.config));
          break;
        case 'bus':
        case 'metros':
        case 'tramways':
        case 'rers':
          renderPublicTransportLegacy(stop, this.transportSchedules, this.transportLastUpdate, this.config)
            .forEach((row) => table.appendChild(row));
          break;
        case 'transiliensNavitia':
          renderPublicTransportNavitia(stop, this.transportSchedules, this.transportLastUpdate, this.config)
            .forEach((row) => table.appendChild(row));
          break;
        case 'transiliens':
          renderPublicTransportTransilien(stop, this.transportSchedules, this.transportLastUpdate, this.config)
            .forEach((row) => table.appendChild(row));
          break;
        case 'velib':
          table.appendChild(renderVelib(stop, this.velibHistory, this.config));
          break;
      }
    });

    return wrapper;
  },

  // Intercepts server side events
  socketNotificationReceived: function(notification: string, payload: Object): void {
    const { debug } = this.config;
    const { id, lastUpdate, schedules } = payload;
    const lastUpdateMoment = moment(lastUpdate);
    this.caller = notification;

    switch (notification) {
      case NOTIF_TRANSPORT:
        this.transportSchedules[id] = schedules;
        this.transportLastUpdate[id] = lastUpdateMoment;
        this.loaded = true;
        break;
      case NOTIF_VELIB:
        if (!this.velibHistory[id]) {
          this.velibHistory[id] = localStorage[id] ? JSON.parse(localStorage[id]) : [];
          this.velibHistory[id].push(payload);
          localStorage[id] = JSON.stringify(this.velibHistory[id]);

          if (debug) console.log (' *** size of velib History for ' + id + ' is: ' + this.velibHistory[id].length);

        } else if (this.velibHistory[id][this.velibHistory[id].length - 1].lastUpdate !== lastUpdateMoment) {
          this.velibHistory[id].push(payload);
          localStorage[id] = JSON.stringify(this.velibHistory[id]);

          if (debug) {
            console.log (' *** size of velib History for ' + id + ' is: ' + this.velibHistory[id].length);
            console.log (this.velibHistory[id]);
          }

        } else if (debug) {
          console.log(' *** redundant velib payload for ' + id + ' with time ' + lastUpdate + ' && ' + this.velibHistory[id][this.velibHistory[id].length - 1].lastUpdate);
        }
        this.loaded = true;
        break;
      case NOTIF_TRAFFIC:
        if (debug) {
          console.log(' *** received traffic information for: ' + id);
          console.log(payload);
        }

        this.ratpTraffic[id] = payload;
        this.ratpTrafficLastUpdate[id] = lastUpdateMoment;
        this.loaded = true;
        break;
      case NOTIF_UPDATE:
        this.config.lastUpdate = lastUpdateMoment;
        break;
    }

    this.updateDom();
  },
});
