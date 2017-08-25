import React from 'react';
import renderer from 'react-test-renderer';
import Main from './Main';

jest.mock('../Traffic/Traffic', () => () => <ul>Traffic component</ul>);

describe('Main component', () => {
  const config = {};

  it('should render correctly at initial state', () => {
    // given-when
    const component = renderer.create(
      <Main config={config} />,
    );

    // then
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
