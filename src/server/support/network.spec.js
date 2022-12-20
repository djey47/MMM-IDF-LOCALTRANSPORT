/* @flow */

import { getProxySettings } from './network';

const mockGetNPMConfig = jest.fn();
jest.mock('./helperConfiguration', () => ({
  getNPMConfig: () => mockGetNPMConfig(),
}));

describe('network helper functions', () => {
  beforeEach(() => {
    mockGetNPMConfig.mockReset();
  });

  describe('getProxySettings function', () => {
    it('should return undefined when no proxy entry found', () => {
      // given
      mockGetNPMConfig.mockReturnValue({});

      // when-then
      expect(getProxySettings()).toBe(undefined);
    });

    it('should return proxy settings when available', () => {
      // given
      mockGetNPMConfig.mockReturnValue({ proxy: 'http://USER:PASSWORD@HOST:PORT' });

      // when-then
      expect(getProxySettings()).toEqual({
        host: 'HOST',
        port: 'PORT',
        proxyAuth: 'USER:PASSWORD',
      });
    });
  });
});
