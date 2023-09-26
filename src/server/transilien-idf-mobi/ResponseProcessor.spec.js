/* @flow*/

import moment from 'moment-timezone';
import ResponseProcessor from './ResponseProcessor';

import type { StationConfiguration } from '../../types/Configuration';
import type { DecodedRef, TransilienStopMonitoringResponse } from '../../types/Transport';

const mockDecodeRefValue = jest.fn();
jest.mock('../../support/railwayRepository', () => ({
  decodeRefValue: (c) => mockDecodeRefValue(c),
}));

beforeAll(() => {
  moment.tz.setDefault('UTC');
  ResponseProcessor.now = jest.fn(() => moment('2017-06-20T12:45:23.968Z'));
});

const apiData: TransilienStopMonitoringResponse = {
  Siri: {
    ServiceDelivery: {
      StopMonitoringDelivery: [{
        MonitoredStopVisit: [{
          MonitoredVehicleJourney: {
            DestinationRef: {
              value: 'dest-ref-value',
            },
            DestinationName: [{
              value: 'dest-name',
            }],
            DirectionName: [{
              value: 'dir-name',
            }],
            JourneyNote: [{
              value: 'POPI',
            }],
            MonitoredCall: {
              AimedArrivalTime: '2017-06-20T12:46:00.000Z',
              ArrivalPlatformName: {
                value: 'pf1',
              },
              ArrivalStatus: '',
              DestinationDisplay: [{
                value: 'dest-display-value',
              }],
              ExpectedArrivalTime: '2017-06-20T12:52:00.000Z',
              ExpectedDepartureTime: '2017-06-20T12:52:00.000Z',
              VehicleAtStop: false,
            },
            TrainNumbers: {
              TrainNumberRef: [{
                value: 'train-nb',
              }],
            },
          },
        }, {
          MonitoredVehicleJourney: {
            DestinationRef: {
              value: 'dest-ref-value',
            },
            DestinationName: [{
              value: 'dest-name',
            }],
            DirectionName: [{
              value: 'dir-name',
            }],
            JourneyNote: [{
              value: 'PEBU',
            }],
            MonitoredCall: {
              AimedArrivalTime: '2017-06-20T13:41:00.000Z',
              ArrivalPlatformName: {
                value: 'pf2',
              },
              ArrivalStatus: 'onTime',
              DestinationDisplay: [{
                value: 'dest-display-value',
              }],
              ExpectedArrivalTime: '2017-06-20T13:41:00.000Z',
              ExpectedDepartureTime: '2017-06-20T13:41:00.000Z',
              VehicleAtStop: false,
            },
            TrainNumbers: {
              TrainNumberRef: [{
                value: 'train-nb',
              }],
            },
          },
        }, {
          MonitoredVehicleJourney: {
            DestinationRef: {
              value: 'dest-ref-other-value',
            },
            DestinationName: [{
              value: 'dest-other-name',
            }],
            DirectionName: [{
              value: 'dir-other-name',
            }],
            JourneyNote: [{
              value: 'POPE',
            }],
            MonitoredCall: {
              AimedArrivalTime: '2017-06-20T13:51:00.000Z',
              ArrivalPlatformName: {
                value: 'pf3',
              },
              ArrivalStatus: 'onTime',
              DestinationDisplay: [{
                value: 'dest-display-other-value',
              }],
              ExpectedArrivalTime: '2017-06-20T13:51:00.000Z',
              ExpectedDepartureTime: '2017-06-20T13:51:00.000Z',
              VehicleAtStop: false,
            },
            TrainNumbers: {
              TrainNumberRef: [{
                value: 'train-nb',
              }],
            },
          },
        }],
      }],
    },
  },
};

describe('ResponseProcessor for transiliens', () => {
  describe('dataToSchedule private function', () => {
    const stopConfig: StationConfiguration = {
      type: 'transiliens',
      station: 'becon',
      destination: 'paris saint lazare',
      line: 'L',
      transilienRefData: {
        destinationRef: 'dest-ref',
        stopAreaRef: 'stop-ref',
        lineRef: 'line-ref',
      },
      label: 'Becon L (trans)',
    };

    beforeEach(() => {
      mockDecodeRefValue.mockReset();
    });    
  
    it('should convert data correctly', () => {
      // given
      const decodedRef: DecodedRef = {
        owner: 'OWNER',
        ref: 'dest-ref',
        type: 'TYPE',
        subType: 'SUB_TYPE',
      };             
      const decodedRefOther: DecodedRef = {
        owner: 'OWNER',
        ref: 'dest-other-ref',
        type: 'TYPE',
        subType: 'SUB_TYPE',
      };             
      mockDecodeRefValue.mockImplementation(code => {
        if (code === 'dest-ref-value') {
          return decodedRef;
        }
        return decodedRefOther;
      });

      // when
      const actual = ResponseProcessor.dataToSchedule(apiData, stopConfig);

      // then
      const expected = {
        id: 'ligne/line-ref/gare/stop-ref/dest-ref/stop-monitoring',
        lastUpdate: '2017-06-20T12:45:23.968Z',
        schedules: [
          {
            destination: 'dest-name',
            code: 'POPI',
            info: 'Train heading to platform pf1',
            status: 'DELAYED',
            time: '2017-06-20T12:52:00.000Z',
            timeMode: 'REALTIME',
          }, {
            destination: 'dest-name',
            code: 'PEBU',
            info: 'Train heading to platform pf2',
            status: 'ON_TIME',
            time: '2017-06-20T13:41:00.000Z',
            timeMode: 'REALTIME',
          },
        ],
      };
      expect(actual).toEqual(expected);
    });
  
    it('should return ANY schedule with non existing destination', () => {
      // given
      const filteredStopConfig: StationConfiguration = {
        ...stopConfig,
        destination: 'foo',
        transilienRefData: undefined,
      };
      const decodedRef: DecodedRef = {
        owner: 'OWNER',
        ref:'dest-ref-bar',
        type: 'TYPE',
        subType: 'SUB_TYPE',
      };             
      mockDecodeRefValue.mockReturnValue(decodedRef);

      // when
      const actual = ResponseProcessor.dataToSchedule(apiData, filteredStopConfig);

      // then
      // $FlowFixMe: always valid
      expect(actual.schedules.length).toEqual(3);
    });
  });
});

