import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from '../../../../tools/test/enzyme';
import Main from './Main';

jest.mock('../Traffic/Traffic', () => () => <ul>Traffic component</ul>);

const config = {
  blockOrder: {
    traffic: 3,
    schedules: 2,
    velib: 1,
  },
};

describe('Main component', () => {
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

describe('orderBlocks function', () => {
  it('should order component blocks accordingly', () => {
    // given
    const b1 = <div>This is Traffic component</div>;
    const b2 = null;
    const b3 = <div>This is Velib component</div>;
    const component = shallow(<Main config={config} />);

    // when
    const actual = component.instance().orderBlocks([b1, b2, b3]);

    // then
    expect(actual).toEqual([b3, b2, b1]);
  });
});
