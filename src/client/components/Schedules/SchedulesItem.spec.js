import React from 'react';
import renderer from 'react-test-renderer';
import moment from 'moment-timezone';
import SchedulesItem from './SchedulesItem';

const mockNow = jest.fn();
jest.mock('../../support/date', () => ({
  now: () => mockNow(),
}));

beforeAll(() => {
  moment.tz.setDefault('UTC');
  mockNow.mockImplementation(() => moment('2017-07-27T08:23:55Z'));
});

describe('SchedulesItem component', () => {
  const baseConfig = {
    convertToWaitingTime: false,
    maxLettersForDestination: 256,
    maximumEntries: 3,
    messages: {},
  };

  const stop = {
    line: ['BUS', 275],
    station: 'Ulbach',
    destination: 'La+Defense',
  };

  it('should render correctly without schedule', () => {
    // given
    const data = {
      schedules: [],
    };

    // when
    const component = renderer.create(
      <SchedulesItem data={data} stop={{}} config={baseConfig} />,
    );

    // then
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render correctly with provided schedules', () => {
    // given
    const data = {
      schedules: [{
        time: '2017-07-16T13:00:00.000Z',
        destination: 'La Défense',
      },{
        time: '2017-07-16T13:05:00.000Z',
        destination: 'Place Charras',       
      }],
    };

    // when
    const component = renderer.create(
      <SchedulesItem data={data} stop={stop} config={baseConfig} />,
    );

    // then
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render correctly with schedule and status info', () => {
    // given
    const rerStop = {
      line: 'A',
      station: 'La+Defense',
      destination: 'a',
    };
    const data = {
      schedules: [{
        time: '2017-05-30T13:00:00.000Z',
        status: 'DELAYED',
        destination: 'La Défense',
        code: 'UAPY',
      }],
    };

    // when
    const component = renderer.create(
      <SchedulesItem data={data} stop={rerStop} config={baseConfig} />,
    );

    // then
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });  

  it('should render correctly with schedule and mission code', () => {
    // given
    const transilienStop = {
      line: 'L',
      station: 'Becon',
    };    
    const data = {
      schedules: [{
        time: '2017-05-30T13:00:00.000Z',
        status: '',
        code: 'POPU',
        destination: 'Saint-Lazare',
      }],
    };

    // when
    const component = renderer.create(
      <SchedulesItem data={data} stop={transilienStop} config={baseConfig} />,
    );

    // then
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();   
  });  

  it('should render correctly with schedule and theorical time mode', () => {
    // given
    const data = {
      schedules: [{
        time: '2017-05-30T13:00:00.000Z',
        timeMode: 'THEORICAL',
        destination: 'La Défense',
      }],
    };

    // when
    const component = renderer.create(
      <SchedulesItem data={data} stop={stop} config={baseConfig} />,
    );

    // then
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();    
  });

  it('should render correctly with schedule and convert to waiting time', () => {
    // given
    mockNow.mockImplementation(() => moment('2017-05-30T12:45:00.000Z'));
    const data = {
      schedules: [{
        time: '2017-05-30T13:00:00.000Z',
        destination: 'La Défense',
      },{
        time: '2017-05-30T13:15:00.000Z',
        destination: 'Place Charras',       
      }],
    };
    const config = {
      ...baseConfig,
      convertToWaitingTime: true,
    };

    // when
    const component = renderer.create(
      <SchedulesItem data={data} stop={stop} config={config} />,
    );

    // then
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();        
  });  
});
