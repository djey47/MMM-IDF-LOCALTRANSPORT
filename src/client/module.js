/* @flow */

/* Timetable for Paris local transport Module */

/* Magic Mirror
 * Module: MMM-IDF-LOCALTRANSPORT
 *
 * Based on script by da4throux
 * MIT Licensed.
 */

import moment from 'moment-timezone';

import {
  NOTIF_UPDATE,
} from '../support/notifications';
import { MODULE_NAME, defaults, enhanceConfiguration } from '../support/configuration';
import {
  renderWrapper,
  renderHeader,
} from './dom/renderer';
import ModuleBoostrap from './support/bootstrap';

Module.register(MODULE_NAME,{
  // Define module defaults
  defaults,

  // Define required scripts.
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
    if (this.loaded) {
      ModuleBoostrap(this.config);
      this.viewEngineStarted = true;
    }

    if (this.loaded || this.viewEngineStarted) {
      return;
    }
  
    return renderWrapper(this.loaded, this.config.messages);
  },

  /**
   * Intercepts server side events
   */ 
  socketNotificationReceived: function(notification: string, payload: Object): void {
    if (notification !== NOTIF_UPDATE) {
      return;
    }

    const { lastUpdate } = payload;
    const lastUpdateMoment = moment(lastUpdate);
    this.caller = notification;

    this.config.lastUpdate = lastUpdateMoment;
    this.loaded = true;
    this.updateDom();
  },
});
