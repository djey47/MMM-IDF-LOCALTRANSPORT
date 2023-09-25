/* @flow */

import moment from 'moment-timezone';
import { NOTIF_TRANSPORT } from '../../support/notifications';
import { Status, TimeModes } from '../../support/status';
import Transilien from '../../support/api/transilien';
import { decodeRefValue } from '../../support/railwayRepository';

import type Moment from 'moment';
import type { StationConfiguration } from '../../types/Configuration';
import type { Schedule, TransilienStopMonitoringResponse, ServerScheduleResponse, TransilienValue } from '../../types/Transport';
import type { TimeInfo } from '../../types/Time';

const { createIndexFromStopConfig } = Transilien;

const {
  REALTIME,
} = TimeModes;

const {
  ON_TIME,
  DELAYED,
  DELETED,
  UNKNOWN,
} = Status;

// TODO Find value for DELAYED
const STATUSES = {
  'onTime': ON_TIME,
  '???': DELAYED,
  'cancelled': DELETED,
};

const ResponseProcessor = {
  /**
   * @private
   */
  now: function (): Moment {
    return moment();
  },

  /**
   * @private
   */
  getGeneralInfo: function (arrivalPlatform: TransilienValue, isVehicleAtStop: boolean) {
    // TODO wordings?
    const trainStatus = isVehicleAtStop ? 'stopped at' : 'heading to';
    const platform = arrivalPlatform ? arrivalPlatform.value : 'N/A';
    return `Train ${trainStatus} platform ${platform}`;
  },  
  
  /**
   * @private
   */
  getStatus: function (etat?: string): string {
    if (!etat) return UNKNOWN;
    return STATUSES[etat] || UNKNOWN;
  },

  /**
   * @private
   */
  getTimeInfo: function (time: string): TimeInfo {
    // console.log({ time });

    return {
      time: moment(time).toISOString(),
      timeMode: REALTIME,
    };
  },

  createDefaultSchedule: function (): Schedule {
    const defaultSchedule: Schedule = {
      destination: '',
      status: Status.TERMINATED,
    };
    return defaultSchedule;
  },

  /**
   * @private
   */
  dataToSchedule: function (data: TransilienStopMonitoringResponse, stopConfig: StationConfiguration): ServerScheduleResponse | {} {
    const { Siri: { ServiceDelivery: {StopMonitoringDelivery}}} = data;

    if (!StopMonitoringDelivery.length) {
      return {};
    }

    const [delivery] = StopMonitoringDelivery;
    const { MonitoredStopVisit: stopVisits } = delivery;

    const schedules = stopVisits
      .filter((sv) => {
        // Accept train matching wanted destination (if specified)
        const { MonitoredVehicleJourney: journey } = sv;
        const { DestinationRef: destRef } = journey;
        const parsedDestRef = decodeRefValue(destRef.value);
        return !stopConfig.transilienRefData 
          || !stopConfig.transilienRefData.destinationRef
          || parsedDestRef.ref === stopConfig.transilienRefData.destinationRef;
      })
      .filter((sv) => {
        // Filter out outdated passages
        const { MonitoredVehicleJourney: journey } = sv;
        const {
          MonitoredCall: { ExpectedArrivalTime: expectedArrivalTime },
        } = journey;
        const now = this.now();

        // console.log(now.toISOString(), { expectedArrivalTime });

        return now.isBefore(expectedArrivalTime);
      })
      .map((sv)  => {
        const { MonitoredVehicleJourney: journey } = sv;

        // console.log({ journey });

        const {
          JourneyNote: journeyNotes,
          DestinationName: destinations,
          MonitoredCall: {
            ExpectedArrivalTime: expectedArrivalTime,
            ArrivalStatus: arrivalStatus,
            ArrivalPlatformName: arrivalPlatform,
            VehicleAtStop: isVehicleAtStop,
          },
        } = journey;
        const missionCode = journeyNotes.length ? journeyNotes[0].value : undefined;
        return {
          ...ResponseProcessor.getTimeInfo(expectedArrivalTime),
          destination: destinations[0].value,
          status: ResponseProcessor.getStatus(arrivalStatus),
          code: missionCode,
          info: ResponseProcessor.getGeneralInfo(arrivalPlatform, isVehicleAtStop),
        };
      })
      .sort((schedule1: Schedule, schedule2: Schedule) => {

        // console.log({ schedule1, schedule2 });

        const firstCriteria = schedule1.destination.localeCompare(schedule2.destination);
        if (firstCriteria === 0) {
          const moment1 = moment(schedule1.time);
          const moment2 = moment(schedule2.time);
          return moment1.isBefore(moment2) ? -1 : 1;
        }
        return firstCriteria;
      });

    const effectiveSchedules = schedules.length ? schedules : [ResponseProcessor.createDefaultSchedule()];

    const response: ServerScheduleResponse = {
      id: createIndexFromStopConfig(stopConfig),
      lastUpdate: ResponseProcessor.now().toISOString(),
      schedules: effectiveSchedules,
    };

    // console.log({ response });

    return response;
  },

  /**
   * Handles Transilien realtime response
   * 
   * @param {string} data data received from Transilien API
   * @param {Object} context whole module context
   * @param {Object} stopConfig associated stop configuration
   */
  processTransportTransilien: function (data: TransilienStopMonitoringResponse, context: Object, stopConfig: StationConfiguration) {
    const { config: { debug } } = context;

    if (debug) {
      console.log(' *** processTransportTransilien data', data);
    }

    if (!data) return;

    const schedule = ResponseProcessor.dataToSchedule(data, stopConfig);

    if (debug) {
      console.log(' *** processTransportTransilien pushed schedules', schedule.schedules || []);
    }

    context.loaded = true;
    context.sendSocketNotification(NOTIF_TRANSPORT, schedule);
  },
};

export default ResponseProcessor;
