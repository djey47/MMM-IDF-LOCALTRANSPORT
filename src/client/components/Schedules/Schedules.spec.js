import React from 'react';
import renderer from 'react-test-renderer';
import moment from 'moment-timezone';

import Schedules from './Schedules';

jest.mock('./SchedulesItem', () => () => <li>SchedulesItem component</li>);

describe('Schedules component', () => {
  const updateInfo = {
    '/1/': moment('2017-07-27T08:23:40.000Z'),
  };    

  it('should render correctly with provided data', () => {
    // given
    const stop = {
      line: 'L',
    };
    const data = {
      schedules: [{
        status: 'OK',
        summary: 'Summary',
        message: 'Message',
      }],
    };
    const entries = {
      '/1/': {
        data,
        stop,
      },
    };

    // when
    const component = renderer.create(
      <Schedules entries={entries} config={{}} lastUpdateInfo={updateInfo} />,
    );

    // then
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render correctly with provided data and arrival concatenation', () => {
    // given
    const stop = {
      line: 'L',
    };
    const data = {
      schedules: [{
        time: '2017-09-28T08:45:00.000Z',
        timeMode: 'REALTIME',
        destination: 'LA DEFENSE GRANDE ARCHE',
        status: 'ON_TIME',
        code: 'DEFI',
      },
      {
        time: '2017-09-28T09:15:00.000Z',
        timeMode: 'REALTIME',
        destination: 'LA DEFENSE GRANDE ARCHE',
        status: 'ON_TIME',
        code: 'DEFI',
      },
      {
        time: '2017-09-28T08:31:00.000Z',
        timeMode: 'REALTIME',
        destination: 'LA VERRIERE',
        status: 'ON_TIME',
        code: 'VERI',
      },
      {
        time: '2017-09-28T09:01:00.000Z',
        timeMode: 'REALTIME',
        destination: 'LA VERRIERE',
        status: 'ON_TIME',
        code: 'VERI',
      }],
    };
    const entries = {
      '/1/': {
        data,
        stop,
      },
    };
    const config = {
      concatenateArrivals: true,
    };

    // when
    const component = renderer.create(
      <Schedules entries={entries} config={config} lastUpdateInfo={updateInfo} />,
    );

    // then
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render correctly with no data', () => {
    // given- when
    const component = renderer.create(
      <Schedules entries={{}} config={{}} lastUpdateInfo={{}} />,
    );

    // then
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
