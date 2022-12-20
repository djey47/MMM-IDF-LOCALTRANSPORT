import ModuleDefinitions from './helper_impl';
import LegacyResponseProcessor from './legacy/ResponseProcessor';
import TrafficResponseProcessor from './legacy/TrafficResponseProcessor';
import TransilienResponseProcessor from './transilien/ResponseProcessor';
import VelibResponseProcessor from './velib/ResponseProcessor';

const scheduleUpdate = ModuleDefinitions.scheduleUpdate;
const scheduleUpdateMock = jest.fn();
const sendSocketNotificationMock = jest.fn();
const getResponseMock = jest.fn();
const getResponseReal = ModuleDefinitions.getResponse;
const processFunctionMock = jest.fn();
const mockAxiosThen = jest.fn(() => ({
  catch: () => null,
}));
const mockAxiosGet = jest.fn(() => ({
  then: () => mockAxiosThen(),
}));
const mockNetworkGetProxySettings = jest.fn();

jest.mock('axios');
const mockAxios = require('axios');
mockAxios.get.mockImplementation((url, axiosConfig) => mockAxiosGet(url, axiosConfig));

jest.mock('tunnel');
const mockTunnel = require('tunnel');

jest.mock('./support/network');
const mockNetwork = require('./support/network');
mockNetwork.getProxySettings.mockImplementation(() => mockNetworkGetProxySettings());

beforeEach(() => {
  delete(ModuleDefinitions.started);
  ModuleDefinitions.config = {
    debug: false,
  };
  ModuleDefinitions.retryDelay = 5000;
  ModuleDefinitions.loaded = false;

  ModuleDefinitions.scheduleUpdate = scheduleUpdate;
  ModuleDefinitions.sendSocketNotification = sendSocketNotificationMock;

  scheduleUpdateMock.mockReset();
  sendSocketNotificationMock.mockReset();
  getResponseMock.mockReset();
  processFunctionMock.mockReset();
  mockNetworkGetProxySettings.mockReset();
});

afterEach(() => {
  ModuleDefinitions.getResponse = getResponseReal;
});

describe('helper implementation', () => {
  describe('proxy initialization', () => {
    it('should invoke tunnel', () => {
      // given-when-then
      expect(mockTunnel.httpsOverHttp).toHaveBeenCalledWith({ proxy: undefined });
    });
  });

  describe('start function', () => {
    it('should set started to false', () => {
      // given
      ModuleDefinitions.started = true;
      // when
      ModuleDefinitions.start();
      // then
      expect(ModuleDefinitions.started).toEqual(false);
    });
  });

  describe('socketNotificationReceived function', () => {
    it('should keep started to false if unexpected notification', () => {
      // given
      delete(ModuleDefinitions.config);
      // when
      ModuleDefinitions.socketNotificationReceived('HELLO');
      // then
      expect(ModuleDefinitions.started).toBeFalsy();
      expect(ModuleDefinitions.config).toBeFalsy();
    });

    it('should set started to true and received configuration', () => {
      // given
      ModuleDefinitions.scheduleUpdate = scheduleUpdateMock;
      const config = {
        param1: true,
        initialLoadDelay: 1000,
      };
      // when
      ModuleDefinitions.socketNotificationReceived('SET_CONFIG', config);
      // then
      expect(ModuleDefinitions.started).toEqual(true);
      expect(ModuleDefinitions.config).toEqual(config);
      expect(scheduleUpdateMock).toHaveBeenCalledWith(1000);
    });
  });

  describe('scheduleUpdate function', () => {
    it('should use configured interval when not provided', () => {
      // given
      ModuleDefinitions.config = {
        updateInterval: 60000,
      };
      // when
      ModuleDefinitions.scheduleUpdate();
      // then
      expect(ModuleDefinitions.updateTimer).toBeTruthy();
    });

    it('should use provided interval', () => {
      // given
      ModuleDefinitions.config = {
        updateInterval: 60000,
      };
      // when
      ModuleDefinitions.scheduleUpdate(60000);
      // then
      expect(ModuleDefinitions.updateTimer).toBeTruthy();
    });
  });

  describe('updateTimetable function', () => {
    it('should send UPDATE notifications and invoke getResponse function', () => {
      // given
      ModuleDefinitions.config = {
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
      ModuleDefinitions.getResponse = getResponseMock;
      const transilienStopConfig = ModuleDefinitions.config.stations[4];
      // when
      ModuleDefinitions.updateTimetable();
      // then
      expect(sendSocketNotificationMock).toHaveBeenCalled();
      expect(getResponseMock).toHaveBeenCalledTimes(4);
      expect(getResponseMock).toHaveBeenCalledWith(
        'http://apiVelib/search?ds=stations&q=2099',
        VelibResponseProcessor.processVelib,
      );
      expect(getResponseMock).toHaveBeenCalledWith(
        'http://api/traffic/tramways/1',
        TrafficResponseProcessor.processTraffic,
      );
      expect(getResponseMock).toHaveBeenCalledWith(
        'http://api/schedules/bus/275/Ulbach/A',
        LegacyResponseProcessor.processTransport,
      );
      expect(getResponseMock).toHaveBeenCalledWith(
        'http://apiTransilien/gare/87382002/depart',
        TransilienResponseProcessor.processTransportTransilien,
        'token',
        transilienStopConfig,
      );
    });
  });

  describe('getResponse function', () => {
    it('should add Authorization header when token provided', () => {
      // given
      const token = 't-o-k-e-n';
      // when
      ModuleDefinitions.getResponse('http://socket.io', processFunctionMock, token, {});
      // then
      const expectedConfig = {
        headers: {
          Accept: 'application/json;charset=utf-8',
          Authorization: 't-o-k-e-n',
        },
      };
      expect(mockAxiosGet).toHaveBeenCalledWith('http://socket.io', expectedConfig);
    });

    it('should not add Authorization header when no token provided', () => {
      // given-when
      ModuleDefinitions.getResponse('http://socket.io', processFunctionMock, null, {});
      // then
      const expectedConfig = {
        headers: {
          Accept: 'application/json;charset=utf-8',
        },
      };
      expect(mockAxiosGet).toHaveBeenCalledWith('http://socket.io', expectedConfig);
    });
  });

  describe('handleApiResponse function', () => {
    it('should not invoke processFunction but schedule next update when response KO', () => {
      // given
      ModuleDefinitions.scheduleUpdate = scheduleUpdateMock;
      // when
      ModuleDefinitions.handleAPIResponse('http://api/schedules/bus/275/Ulbach/A', processFunctionMock, null);
      // then
      expect(processFunctionMock).not.toHaveBeenCalled();
      expect(scheduleUpdateMock).toHaveBeenCalledWith(5000);
    });

    it('should invoke processFunction and schedule next update when response OK and module loaded', () => {
      // given
      ModuleDefinitions.scheduleUpdate = scheduleUpdateMock;
      ModuleDefinitions.loaded = true;
      const response = {
        data: {},
      };
      // when
      ModuleDefinitions.handleAPIResponse('http://api/schedules/bus/275/Ulbach/A', processFunctionMock, response);
      // then
      expect(processFunctionMock).toHaveBeenCalled();
      expect(scheduleUpdateMock).toHaveBeenCalledWith();
    });

    it('should invoke processFunction and schedule next update when response OK and module not loaded', () => {
      // given
      ModuleDefinitions.scheduleUpdate = scheduleUpdateMock;
      const response = {
        data: {},
      };
      // when
      ModuleDefinitions.handleAPIResponse('http://api/schedules/bus/275/Ulbach/A', processFunctionMock, response);
      // then
      expect(processFunctionMock).toHaveBeenCalled();
      expect(scheduleUpdateMock).toHaveBeenCalledWith(5000);
    });
  });
});
