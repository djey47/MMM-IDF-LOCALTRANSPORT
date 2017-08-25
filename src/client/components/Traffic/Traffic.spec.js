import React from 'react';
import renderer from 'react-test-renderer';
import Traffic from './Traffic';

jest.mock('./TrafficItem', () => () => <li>TrafficItem component</li>);

describe('Traffic component', () => {
  it('should render correctly with provided data', () => {
    // given
    const stop = {
      line: 'L',
    };
    const data = {
      status: 'OK',
      summary: 'Summary',
      message: 'Message',
    };
    const entries = {
      '/1/': {
        data,
        stop,
      },
    };

    // when
    const component = renderer.create(
      <Traffic entries={entries} options={{}} messages={{}} />,
    );

    // then
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render correctly with no data', () => {
    // given- when
    const component = renderer.create(
      <Traffic entries={{}} messages={{}} />,
    );

    // then
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
