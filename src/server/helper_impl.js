/* @flow */

import axios from 'axios';
import NavitiaResponseProcessor from './navitia/ResponseProcessor';
import TransilienResponseProcessor from './transilien/ResponseProcessor';
import LegacyResponseProcessor from './legacy/ResponseProcessor';
import TrafficResponseProcessor from './legacy/TrafficResponseProcessor';
import TransilienTrafficResponseProcessor from './citymapper/ResponseProcessor';
import VelibResponseProcessor from './velib/ResponseProcessor';
import Citymapper from '../support/api/citymapper';
import LegacyApi from '../support/api/legacy';
import Transilien from '../support/api/transilien';
import { getNavitiaStopSchedulesUrl } from '../support/api/navitia';
import {
  NOTIF_UPDATE,
  NOTIF_SET_CONFIG,
} from '../support/notifications.js';

import type { StationConfiguration } from '../types/Configuration';

const {
  getTrafficUrl,
  getVelibUrl,
  getScheduleUrl,
} = LegacyApi;

const { getTransilienDepartUrl } = Transilien;

const { getTransilienRouteInfoUrl } = Citymapper;

/**
 * Custom NodeHelper implementation
 * ES6 module export does not work here...
 */
module.exports = {
  loaded: false,

  start: function () {
    this.started = false;
  },

  socketNotificationReceived: function(notification: string, payload: Object) {
    if (notification === NOTIF_SET_CONFIG && !this.started) {
      const { debug, initialLoadDelay } = payload;

      this.config = payload;

      if (debug) {
        console.log (' *** config set in node_helper: ');
        console.log ( payload );
      }

      this.started = true;
      this.scheduleUpdate(initialLoadDelay);
    }
  },

  /**
   * Schedule next update.
   * @param delay Milliseconds before next update. If empty, this.config.updateInterval is used.
  */
  scheduleUpdate: function(delay?: number) {
    const { debug, updateInterval } = this.config;

    let nextLoad = updateInterval;
    if (typeof delay !== 'undefined' && delay >= 0) {
      nextLoad = delay;
    }
    clearTimeout(this.updateTimer);

    if (debug) {
      console.log (' *** scheduleUpdate set next update in ' + nextLoad);
    }

    this.updateTimer = setTimeout(this.updateTimetable.bind(this), nextLoad);
  },

  /**
   * @private
   */
  scheduleRetry: function() {
    if (this.loaded) {
      this.scheduleUpdate();
    } else {
      this.scheduleUpdate(this.retryDelay);
    }
  },

  /**
   * Extracts reponse body if available, otherwise handles retries
   * @param url requested URL
   * @param processFunction callback to send extracted data to
   * @param response API response
   * @param stopConfig associated stop configuration
   * @private
   */
  handleAPIResponse: function(url: string, processFunction: Function, response: Object, stopConfig: StationConfiguration) {
    const { debug } = this.config;
    if (response && response.data) {
      const { data } = response;

      if (debug) {
        console.log (` *** received answer for: ${url}`);
        console.log (data);
        console.log (stopConfig);
      }

      processFunction(data, this, stopConfig);
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

    this.scheduleRetry();
  },

  /**
   * When API error occurs, do particular processing and handle retries
   * @private
   */
  handleAPIError: function(error: any) {
    console.error(error);

    this.scheduleRetry();
  },

  /**
   * Calls API and handles response via callback
   * @param url requested URL
   * @param processFunction callback to send extracted data to
   * @param authToken (optional) authentication token
   * @private
   */
  getResponse: function(url: string, processFunction: Function, authToken: string, stopConfig: StationConfiguration) {
    const { debug } = this.config.debug;
    const headers: Object = {
      Accept: 'application/json;charset=utf-8',
    };
    if (authToken) {
      headers.Authorization = authToken;
    }

    if (debug) console.log (` *** fetching: ${url}`);

    axios.get(url, { headers })
      .then((response => this.handleAPIResponse(url, processFunction, response, stopConfig)).bind(this))
      .catch((error => this.handleAPIError(error)).bind(this));
  },

  /* updateTimetable(transports)
   * Calls corresponding process function on successful response.
  */
  updateTimetable: function() {
    const { debug, stations, apiBaseV3, apiVelib, apiNavitia, apiTransilien, apiCitymapper, navitiaToken, transilienToken, citymapperToken } = this.config;
    
    if (debug) console.log (' *** fetching update');
    
    this.sendSocketNotification(NOTIF_UPDATE, { lastUpdate : new Date()});

    stations.forEach((stopConfig) => {
      const { type } = stopConfig;
      switch (type) {
        case 'tramways':
        case 'bus':
        case 'rers':
        case 'metros':
          this.getResponse(
            getScheduleUrl(apiBaseV3, stopConfig),
            LegacyResponseProcessor.processTransport);
          break;
        case 'velib':
          this.getResponse(
            getVelibUrl(apiVelib, stopConfig),
            VelibResponseProcessor.processVelib);
          break;
        case 'traffic':
          this.getResponse(
            getTrafficUrl(apiBaseV3, stopConfig),
            TrafficResponseProcessor.processTraffic);
          break;
        case 'transiliensTraffic':
          this.getResponse(
            getTransilienRouteInfoUrl(apiCitymapper, stopConfig, citymapperToken),
            TransilienTrafficResponseProcessor.processTraffic);
          break;
        case 'transiliensNavitia':
          this.getResponse(
            getNavitiaStopSchedulesUrl(apiNavitia, stopConfig),
            NavitiaResponseProcessor.processTransportNavitia,
            navitiaToken);
          break;        
        case 'transiliens':
          this.getResponse(
            getTransilienDepartUrl(apiTransilien, stopConfig),
            TransilienResponseProcessor.processTransportTransilien,
            transilienToken,
            stopConfig);
          break;        
        default:
          if (debug) console.log(` *** unknown request: ${type}`);
      }
    });
  },
};
