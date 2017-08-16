import NodeHelperImpl from './helper_impl.js';
import LegacyResponseProcessor from './legacy/ResponseProcessor';
import TrafficResponseProcessor from './legacy/TrafficResponseProcessor';
import TransilienResponseProcessor from './transilien/ResponseProcessor';
import VelibResponseProcessor from './velib/ResponseProcessor';

const scheduleUpdate = NodeHelperImpl.scheduleUpdate;
const scheduleUpdateMock = jest.fn();
const sendSocketNotificationMock = jest.fn();
const getResponseMock = jest.fn();
const getResponseReal = NodeHelperImpl.getResponse;
const processFunctionMock = jest.fn();
const mockAxiosThen = jest.fn(() => ({
  catch: () => null,
}));
const mockAxiosGet = jest.fn(() => ({
  then: () => mockAxiosThen(),
}));

jest.mock('axios', () => ({
  get: (url, axiosConfig) => mockAxiosGet(url, axiosConfig),
}));

beforeEach(() => {
  delete(NodeHelperImpl.started);
  NodeHelperImpl.config = {
    debug: false,
  };
  NodeHelperImpl.retryDelay = 5000;
  NodeHelperImpl.loaded = false;

  NodeHelperImpl.scheduleUpdate = scheduleUpdate;
  NodeHelperImpl.sendSocketNotification = sendSocketNotificationMock;

  scheduleUpdateMock.mockReset();
  sendSocketNotificationMock.mockReset();
  getResponseMock.mockReset();
  processFunctionMock.mockReset();
});

afterEach(() => {
  NodeHelperImpl.getResponse = getResponseReal;
});

describe('start function', () => {
  it('should set started to false', () => {
    // given
    NodeHelperImpl.started = true;
    // when
    NodeHelperImpl.start();
    // then
    expect(NodeHelperImpl.started).toEqual(false);
  });
});

describe('socketNotificationReceived function', () => {
  it('should keep started to false if unexpected notification', () => {
    // given
    delete(NodeHelperImpl.config);    
    // when
    NodeHelperImpl.socketNotificationReceived('HELLO');
    // then
    expect(NodeHelperImpl.started).toBeFalsy();
    expect(NodeHelperImpl.config).toBeFalsy();
  });

  it('should set started to true and received configuration', () => {
    // given
    NodeHelperImpl.scheduleUpdate = scheduleUpdateMock;
    const config = {
      param1: true,
      initialLoadDelay: 1000,
    };
    // when
    NodeHelperImpl.socketNotificationReceived('SET_CONFIG', config);
    // then
    expect(NodeHelperImpl.started).toEqual(true);
    expect(NodeHelperImpl.config).toEqual(config);
    expect(scheduleUpdateMock).toHaveBeenCalledWith(1000);
  });
});

describe('scheduleUpdate function', () => {
  it('should use configured interval when not provided', () => {
    // given
    NodeHelperImpl.config = {
      updateInterval: 60000,
    };
    // when
    NodeHelperImpl.scheduleUpdate();
    // then
    expect(NodeHelperImpl.updateTimer).toBeTruthy();
  });

  it('should use provided interval', () => {
    // given
    NodeHelperImpl.config = {
      updateInterval: 60000,
    };
    // when
    NodeHelperImpl.scheduleUpdate(60000);
    // then
    expect(NodeHelperImpl.updateTimer).toBeTruthy();
  });
});

describe('updateTimetable function', () => {
  it('should send UPDATE notifications and invoke getResponse function', () => {
    // given
    NodeHelperImpl.config = {
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
    NodeHelperImpl.getResponse = getResponseMock;  
    const transilienStopConfig = NodeHelperImpl.config.stations[4];
    // when
    NodeHelperImpl.updateTimetable();
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
    NodeHelperImpl.getResponse('http://socket.io', processFunctionMock, token, {});
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
    NodeHelperImpl.getResponse('http://socket.io', processFunctionMock, null, {});
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
    NodeHelperImpl.scheduleUpdate = scheduleUpdateMock;    
    // when
    NodeHelperImpl.handleAPIResponse('http://api/schedules/bus/275/Ulbach/A', processFunctionMock, null);
    // then
    expect(processFunctionMock).not.toHaveBeenCalled();
    expect(scheduleUpdateMock).toHaveBeenCalledWith(5000);
  });

  it('should invoke processFunction and schedule next update when response OK and module loaded', () => {
    // given
    NodeHelperImpl.scheduleUpdate = scheduleUpdateMock;    
    NodeHelperImpl.loaded = true;
    const response = {
      data: {},
    };
    // when
    NodeHelperImpl.handleAPIResponse('http://api/schedules/bus/275/Ulbach/A', processFunctionMock, response);
    // then
    expect(processFunctionMock).toHaveBeenCalled();
    expect(scheduleUpdateMock).toHaveBeenCalledWith();
  });

  it('should invoke processFunction and schedule next update when response OK and module not loaded', () => {
    // given
    NodeHelperImpl.scheduleUpdate = scheduleUpdateMock;    
    const response = {
      data: {},
    };
    // when
    NodeHelperImpl.handleAPIResponse('http://api/schedules/bus/275/Ulbach/A', processFunctionMock, response);
    // then
    expect(processFunctionMock).toHaveBeenCalled();
    expect(scheduleUpdateMock).toHaveBeenCalledWith(5000);
  });
});
