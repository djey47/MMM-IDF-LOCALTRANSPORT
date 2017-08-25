import React from 'react';
import renderer from 'react-test-renderer';
import TrafficItem from './TrafficItem';

describe('TrafficItem component', () => {
  it('should render correctly with provided data', () => {
    // given
    const label = 'L line';
    const data = {
      status: 'OK',
      summary: 'Summary',
      message: 'Message',
      line: 'L',
    };

    // when
    const component = renderer.create(
      <TrafficItem label={label} data={data} options={{}} messages={{}} />,
    );

    // then
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render correctly with provided data without custom label', () => {
    // given
    const data = {
      status: 'OK',
      summary: 'Summary',
      message: 'Message',
      line: 'L',
    };

    // when
    const component = renderer.create(
      <TrafficItem data={data} options={{}} messages={{}} />,
    );

    // then
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render correctly with provided data with KO status', () => {
    // given
    const data = {
      status: 'KO',
      summary: 'Summary',
      message: 'Message',
      line: 'L',
    };

    // when
    const component = renderer.create(
      <TrafficItem data={data} options={{}} messages={{}} />,
    );

    // then
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
