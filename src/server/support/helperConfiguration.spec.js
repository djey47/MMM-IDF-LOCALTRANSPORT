/* @flow */

import { getNPMConfig } from './helperConfiguration';

const mockExecSync = jest.fn();

jest.mock('child_process', () => ({
  execSync: (command) => mockExecSync(command),
}));

beforeEach(() => {
  mockExecSync.mockReset();
  mockExecSync.mockReturnValue('{ "npm": true, "foo": "bar" }');
});

describe('helper configuration helper functions', () => {
  describe('getNPMConfig function', () => {
    it('should request configuration from NPM client, using cache', () => {
      // given-when
      getNPMConfig();
      getNPMConfig();
      const actual = getNPMConfig();

      // then
      expect(actual).toEqual({
        npm: true,
        foo: 'bar',
      });
      expect(mockExecSync).toHaveBeenCalledTimes(1);
      expect(mockExecSync).toHaveBeenCalledWith('npm config list --json');
    });
  });
});
