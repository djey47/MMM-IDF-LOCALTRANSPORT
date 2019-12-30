/* @flow */

/* Timetable for Paris local transport Module */

/* Magic Mirror
 * Module: MMM-IDF-LOCALTRANSPORT
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
import { MODULE_NAME, defaults, enhanceConfiguration } from '../support/configuration';
import {
  renderWrapper,
  renderHeader,
  renderTrafficLegacy,
  renderTrafficTransilien,
  renderPublicTransportLegacy,
  renderPublicTransportTransilien,
  renderVelib,
} from './dom/renderer';
import {
  TYPE_TRAFFIC_LEGACY,
  TYPE_TRAFFIC_TRANSILIEN,
  TYPE_BUS,
  TYPE_METRO,
  TYPE_RER,
  TYPE_TRAMWAY,
  TYPE_TRANSILIEN,
  TYPE_VELIB,
} from '../support/configuration';

Module.register(MODULE_NAME,{
  // Define module defaults
  defaults,

  // Define required scripts.
  getStyles: function(): Array<string> {
    return [
      this.file('css/reset.css'),
      this.file('css/module.css'),
      'font-awesome.css',
    ];
  },

  // Define start sequence.
  start: function(): void {
    Log.info(`Starting module: ${this.name}`);

    enhanceConfiguration(this.config, this.sendSocketNotification.bind(this));

    this.transportSchedules = {};
    this.transportLastUpdate = {};
    this.allTraffic = {};
    this.allTrafficLastUpdate = {};
    this.velibHistory = {};
    this.loaded = false;
    this.updateTimer = null;
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
        case TYPE_TRAFFIC_LEGACY:
          table.appendChild(renderTrafficLegacy(stop, this.allTraffic, this.config));
          break;
        case TYPE_TRAFFIC_TRANSILIEN:
          table.appendChild(renderTrafficTransilien(stop, this.allTraffic, this.config));
          break;
        case TYPE_BUS:
        case TYPE_METRO:
        case TYPE_TRAMWAY:
        case TYPE_RER:
          renderPublicTransportLegacy(stop, this.transportSchedules, this.transportLastUpdate, this.config)
            .forEach((row) => table.appendChild(row));
          break;
        case TYPE_TRANSILIEN:
          renderPublicTransportTransilien(stop, this.transportSchedules, this.transportLastUpdate, this.config)
            .forEach((row) => table.appendChild(row));
          break;
        case TYPE_VELIB:
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

          if (debug) {console.log (' *** size of velib History for ' + id + ' is: ' + this.velibHistory[id].length);}

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

        this.allTraffic[id] = payload;
        this.allTrafficLastUpdate[id] = lastUpdateMoment;
        this.loaded = true;
        break;
      case NOTIF_UPDATE:
        this.config.lastUpdate = lastUpdateMoment;
        break;
    }

    this.updateDom();
  },
});
