/* @flow */

import NodeHelper from './node_helper_impl.js';
import LegacyResponseProcessor from './legacy/ResponseProcessor';
import TrafficResponseProcessor from './traffic/ResponseProcessor';
import TransilienResponseProcessor from './transilien/ResponseProcessor';
import VelibResponseProcessor from './velib/ResponseProcessor';

const scheduleUpdate = NodeHelper.scheduleUpdate;
const scheduleUpdateMock = jest.fn();
const sendSocketNotificationMock = jest.fn();
const getResponseMock = jest.fn();
const processFunctionMock = jest.fn();

beforeEach(() => {
  delete(NodeHelper.started);
  NodeHelper.config = {};
  NodeHelper.retryDelay = 5000;
  NodeHelper.loaded = false;

  NodeHelper.scheduleUpdate = scheduleUpdate;
  NodeHelper.sendSocketNotification = sendSocketNotificationMock;
  NodeHelper.getResponse = getResponseMock;

  scheduleUpdateMock.mockReset();
  sendSocketNotificationMock.mockReset();
  getResponseMock.mockReset();
  processFunctionMock.mockReset();
});

describe('start function', () => {
  it('should set started to false', () => {
    // given
    NodeHelper.started = true;
    // when
    NodeHelper.start();
    // then
    expect(NodeHelper.started).toEqual(false);
  });
});

describe('socketNotificationReceived function', () => {
  it('should keep started to false if unexpected notification', () => {
    // given
    delete(NodeHelper.config);    
    // when
    NodeHelper.socketNotificationReceived('HELLO');
    // then
    expect(NodeHelper.started).toBeFalsy();
    expect(NodeHelper.config).toBeFalsy();
  });

  it('should set started to true and received configuration', () => {
    // given
    NodeHelper.scheduleUpdate = scheduleUpdateMock;
    const config = {
      param1: true,
      initialLoadDelay: 1000,
    };
    // when
    NodeHelper.socketNotificationReceived('SET_CONFIG', config);
    // then
    expect(NodeHelper.started).toEqual(true);
    expect(NodeHelper.config).toEqual(config);
    expect(scheduleUpdateMock).toHaveBeenCalledWith(1000);
  });
});

describe('scheduleUpdate function', () => {
  it('should use configured interval when not provided', () => {
    // given
    NodeHelper.config = {
      updateInterval: 60000,
    };
    // when
    NodeHelper.scheduleUpdate();
    // then
    expect(NodeHelper.updateTimer).toBeTruthy();
  });

  it('should use provided interval', () => {
    // given
    NodeHelper.config = {
      updateInterval: 60000,
    };
    // when
    NodeHelper.scheduleUpdate(60000);
    // then
    expect(NodeHelper.updateTimer).toBeTruthy();
  });
});

describe('updateTimetable function', () => {
  it('should send UPDATE notifications and invoke getResponse function', () => {
    // given
    NodeHelper.config = {
      apiBaseV3: 'http://api/',
      apiVelib: 'http://apiVelib/search?ds=stations',
      apiTransilien: 'http://apiTransilien/',
      transilienToken: 'token',
      stations: [{
        type: 'unhandled',
      },{
        type: 'bus',
        line: 275,
        station: 'Ulbach',
        destination: 'A',
      },{
        type: 'traffic',
        line: ['tramways', 1],
      },{
        type: 'velib',
        station: 2099,
      },{
        type: 'transiliens',
        station: 'Becon',
        uic: {
          station: '87382002',
        },
      }],
    };
    // when
    NodeHelper.updateTimetable();
    // then
    expect(sendSocketNotificationMock).toHaveBeenCalled();
    expect(getResponseMock).toHaveBeenCalledTimes(4);
    expect(getResponseMock).toHaveBeenCalledWith('http://apiVelib/search?ds=stations&q=2099', VelibResponseProcessor.processVelib);
    expect(getResponseMock).toHaveBeenCalledWith('http://api/traffic/tramways/1', TrafficResponseProcessor.processTraffic);
    expect(getResponseMock).toHaveBeenCalledWith('http://api/schedules/bus/275/Ulbach/A', LegacyResponseProcessor.processTransport);
    expect(getResponseMock).toHaveBeenCalledWith('http://apiTransilien/gare/87382002/depart', TransilienResponseProcessor.processTransportTransilien, 'token');
  });
});

describe('handleApiResponse function', () => {
  it('should not invoke processFunction but schedule next update when response KO', () => {
    // given
    NodeHelper.scheduleUpdate = scheduleUpdateMock;    
    // when
    NodeHelper.handleAPIResponse('http://api/schedules/bus/275/Ulbach/A', processFunctionMock, null);
    // then
    expect(processFunctionMock).not.toHaveBeenCalled();
    expect(scheduleUpdateMock).toHaveBeenCalledWith(5000);
  });

  it('should invoke processFunction and schedule next update when response OK and module loaded', () => {
    // given
    NodeHelper.scheduleUpdate = scheduleUpdateMock;    
    NodeHelper.loaded = true;
    const response = {
      data: {},
    };
    // when
    NodeHelper.handleAPIResponse('http://api/schedules/bus/275/Ulbach/A', processFunctionMock, response);
    // then
    expect(processFunctionMock).toHaveBeenCalled();
    expect(scheduleUpdateMock).toHaveBeenCalledWith();
  });

  it('should invoke processFunction and schedule next update when response OK and module not loaded', () => {
    // given
    NodeHelper.scheduleUpdate = scheduleUpdateMock;    
    const response = {
      data: {},
    };
    // when
    NodeHelper.handleAPIResponse('http://api/schedules/bus/275/Ulbach/A', processFunctionMock, response);
    // then
    expect(processFunctionMock).toHaveBeenCalled();
    expect(scheduleUpdateMock).toHaveBeenCalledWith(5000);
  });
});
