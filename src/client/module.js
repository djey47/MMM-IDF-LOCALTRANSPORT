/* @flow */

/* Magic Mirror: Timetable for Paris local transport Module
 * Module: MMM-IDF-LOCALTRANSPORT
 *
 * Based on script by da4throux
 * MIT Licensed.
 */

import moment from 'moment-timezone';

import {
  NOTIF_INIT,
  NOTIF_DOM_OBJECTS_CREATED,  
  NOTIF_UPDATE,
  NOTIF_TRAFFIC,
} from '../support/notifications';
import { 
  MODULE_NAME,
  defaults,
  enhanceConfiguration,
} from '../support/configuration';
import {
  renderWrapper,
  renderHeader,
  renderMainComponent,
} from './dom/renderer';
import {
  DATA_TRAFFIC,
} from './support/dataKind';


Module.register(MODULE_NAME,{
  // Define module defaults
  defaults,

  /**
   * Defines required scripts.
   */ 
  getStyles: function(): Array<string> {
    return [
      this.file('css/module.css'), // TODO remove when css properly bundled
      'font-awesome.css',
    ];
  },

  /**
   * Defines start sequence.
   */
  start: function(): void {
    Log.info('Starting module: ' + this.name);

    enhanceConfiguration(this.config, this.sendSocketNotification.bind(this));

    // Global state
    this.transportSchedules = {};
    this.transportLastUpdate = {};
    this.allTraffic = {};
    this.allTrafficLastUpdate = {};
    this.velibHistory = {};
    this.loaded = false;
    this.updateTimer = null;
    this.viewEngineStarted = false;
  },

  /**
   * What's being written on top
   */
  getHeader: function(): string {
    return renderHeader(this.data, this.config);
  },

  /**
   * Overrides DOM generator.
   * At first, it will create module wrapper and return it to be correctly attached to MM2 app.
   * When module is loaded (configuration updated server-side), will start REACT engine.
   */
  getDom: function(): any {
    if (this.viewEngineStarted) {
      return;
    }
    return renderWrapper();
  },

  /**
   * Intercepts local events
   */
  notificationReceived: function(notification: string): void {
    if (this.config.debug) Log.info(`**${this.name} notificationReceived: ${notification}`);

    if (notification === NOTIF_DOM_OBJECTS_CREATED) {
      renderMainComponent(this.config);
      this.viewEngineStarted = true;
    }
  },

  /**
   * Intercepts server side events
   */ 
  socketNotificationReceived: function(notification: string, payload: Object): void {
    if (this.config.debug) Log.info(`**${this.name} socketNotificationReceived: ${notification}`);

    switch(notification) {
      case NOTIF_INIT:
        this.loaded = true;
        break;
      case NOTIF_UPDATE:
        this.config.lastUpdate = moment(payload.lastUpdate);
        break;
      case NOTIF_TRAFFIC:
        renderMainComponent(this.config, payload, DATA_TRAFFIC);
        break;
    }
  },
});
