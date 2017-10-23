import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';

Enzyme.configure({ adapter: new Adapter() });

const { shallow, mount, render } = Enzyme;
export { shallow };
export { mount };
export { render };
