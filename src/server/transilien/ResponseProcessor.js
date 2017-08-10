/* @flow */

import moment from 'moment-timezone';

import type Moment from 'moment';

import { NOTIF_TRANSPORT } from '../../support/notifications';
import xmlToJson from '../../support/xml';
import Transilien from '../../support/transilien'; 
import { getAllStationInfo } from '../../support/railwayRepository';
import { Status, TimeModes } from '../../support/status';

import type { TimeInfo } from '../../types/Time';
import type {
  StationInfoQuery,
  StationInfoResult,
  TransilienResponse,
  TransilienPassage,
  Schedule,
  ServerScheduleResponse,
} from '../../types/Transport';
import type { StationConfiguration } from '../../types/Configuration';

const { createIndexFromResponse } = Transilien;

const {
  ON_TIME,
  DELAYED,
  DELETED,
  UNKNOWN,
} = Status;

const {
  REALTIME,
  THEORICAL,
  UNDEFINED,
} = TimeModes;

const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm';

const STATUSES = {
  'Retardé': DELAYED,
  'Supprimé': DELETED,
};

const TIME_MODES = {
  R: REALTIME,
  T: THEORICAL,
  U: UNDEFINED,
};

const ResponseProcessor = {
  /**
   * @private
   */
  now: function(): Moment {
    return moment();
  },
 
  /**
   * @private
   */
  getStatus: function(etat?: string): string {
    if (!etat) return ON_TIME;
    return STATUSES[etat] || UNKNOWN;
  },

  /**
   * @private
   */
  getTimeInfo: function(time: string, mode: string): TimeInfo {
    return {
      time: moment(time, DATE_TIME_FORMAT).toISOString(),
      timeMode: TIME_MODES[mode] || TIME_MODES.U,
    };
  },

  /**
   * @private
   */
  passagesToInfoQueries: function(passages: ?TransilienPassage): Array<StationInfoQuery> {
    if (!passages) return [];

    return passages.train
      .map(({ term }, index) => ({
        index,
        stationValue: term,
      }));    
  },

  /**
   * @private
   */
  dataToSchedule: function(data: TransilienResponse, stopConfig: StationConfiguration, stationInfos: Array<StationInfoResult>): ServerScheduleResponse|{} {
    const { uic } = stopConfig;

    if (!data.passages || !uic) return {};

    const { destination } = uic;
    const { passages: {train} } = data;    
    const schedules = train
      .map((t, index): any => {
        const { date: {_, $: { mode }}, term, miss, etat } = t;
        if (!destination || term === destination) {
          // Accept train matching wanted destination, if specified
          return {
            ...ResponseProcessor.getTimeInfo(_, mode),
            destination: stationInfos[index].stationInfo.libelle,
            status: ResponseProcessor.getStatus(etat),
            code: miss,
          };        
        }

        // Reject train not matching wanted destination
        return null;
      })
      .filter(schedule => !!schedule)
      .sort((schedule1: Schedule, schedule2: Schedule) => {
        const firstCriteria = schedule1.destination.localeCompare(schedule2.destination);
        if (firstCriteria === 0) {
          const moment1 = moment(schedule1.time);
          const moment2 = moment(schedule2.time);
          return moment1.isBefore(moment2) ? -1 : 1; 
        }
        return firstCriteria;
      });

    const response: ServerScheduleResponse = {
      id: createIndexFromResponse(data, destination),
      lastUpdate: ResponseProcessor.now().toISOString(),
      schedules,
    };

    return response;
  },

  /**
   * Handles Transilien realtime response
   * 
   * @param {string} xmlData data received from Transilien XML API
   * @param {Object} context whole module context
   * @param {Object} stopConfig associated stop configuration
   */
  processTransportTransilien: function(xmlData: string, context: Object, stopConfig: StationConfiguration) {
    const { config, config: { debug } } = context;
    const data: ?TransilienResponse = xmlToJson(xmlData);

    if (debug) {
      console.log (' *** processTransportTransilien XML data');
      console.log (xmlData);
      console.log (' *** processTransportTransilien JSON data');
      console.log (data);
    }

    if (!data) return;

    getAllStationInfo(ResponseProcessor.passagesToInfoQueries(data.passages), config)
      .then(stationInfos => {
        context.loaded = true;
        context.sendSocketNotification(NOTIF_TRANSPORT, ResponseProcessor.dataToSchedule(data, stopConfig, stationInfos));
      })
      .catch(error => console.error(error));
  },
};

export default ResponseProcessor;
