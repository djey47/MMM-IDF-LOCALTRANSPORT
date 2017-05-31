/* @flow */

const NodeHelper = require('./node_helper_impl.js');

const scheduleUpdate = NodeHelper.scheduleUpdate;
const scheduleUpdateMock = jest.fn();
const sendSocketNotificationMock = jest.fn();
const getResponseMock = jest.fn();

beforeEach(() => {
  delete(NodeHelper.started);
  delete(NodeHelper.config);
  NodeHelper.scheduleUpdate = scheduleUpdate;
  NodeHelper.sendSocketNotification = sendSocketNotificationMock;
  NodeHelper.getResponse = getResponseMock;
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
    // given-when
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
      }],
    };
    // when
    NodeHelper.updateTimetable();
    // then
    expect(sendSocketNotificationMock).toHaveBeenCalled();
    expect(getResponseMock).toHaveBeenCalledTimes(3);
    // TODO find a way to assert fixed params only
    // expect(getResponseMock).toHaveBeenCalledWith('http://apiVelib/search?ds=stations&q=2099', NodeHelper.processVelib, { station: 2099, type: 'velib' });
    // expect(getResponseMock).toHaveBeenCalledWith('http://api/traffic/tramways/1', NodeHelper.processTraffic, { line: ['tramways', 1], type: 'traffic' });
    // expect(getResponseMock).toHaveBeenCalledWith('http://api/schedules/bus/275/Ulbach/A', NodeHelper.processTransport, { destination: 'A', line: 275, station: 'Ulbach', type: 'bus' });
  });
});

describe('processVelib function', () => {
  it('should send notification with correct values', () => {
    // given
    const fields = {
      status: 'OPEN',
      contract_name: 'Paris',
      name: '14111 - DENFERT-ROCHEREAU CASSINI',
      bonus: 'False',
      bike_stands: 24,
      number: 14111,
      last_update: '2017-04-15T12:14:25+00:00',
      available_bike_stands: 24,
      banking: 'True',
      available_bikes: 0,
      address: '18 RUE CASSINI - 75014 PARIS',
      position: [48.8375492922, 2.33598303047],
    };    
    const data = {
      records: [ { fields } ],
    };
    // when
    NodeHelper.processVelib(data);
    // then
    const expected = {
      bike: 0,
      empty: 24,
      id: 14111,
      last_update: '2017-04-15T12:14:25+00:00',
      loaded: true,
      name: '14111 - DENFERT-ROCHEREAU CASSINI',
      total: 24,
    };    
    expect(sendSocketNotificationMock).toHaveBeenCalledWith('VELIB', expected);
  });
});

describe('processTransport function', () => {
  it('should send notification with correct values', () => {
    // given
    NodeHelper.config = {};
    const data = {
      result: {
        schedules: [{
          code: 'ELOI',
          message: 'Train à quai',
          destination: 'Charles-de-Gaulle. Mitry-Claye.',
        }],
      },
      _metadata: {
        call: 'GET /schedules/rers/b/port+royal/A',
      },
    };
    // when
    NodeHelper.processTransport(data);
    // then
    expect(sendSocketNotificationMock).toHaveBeenCalled();
  });
});

describe('processTraffic function', () => {
  it('should send notification with correct values', () => {
    // given
    NodeHelper.config = {};
    const data = {
      result: {
        schedules: [{
          code: 'ELOI',
          message: 'Train à quai',
          destination: 'Charles-de-Gaulle. Mitry-Claye.',
        }],
      },
      _metadata: {
        call: 'GET /schedules/rers/b/port+royal/A',
      },
    };
    // when
    NodeHelper.processTraffic(data);
    // then
    expect(sendSocketNotificationMock).toHaveBeenCalled();
  });
});
