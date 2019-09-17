/* @flow */

import { getNPMConfig } from './helperConfiguration';

/** Network helper functions */

type ProxySettings = {
  host: string,
  port: string,
  proxyAuth: string,
};

/**
* @returns proxy settings from NPM configuration
*/
export function getProxySettings(): ?ProxySettings {
  const { proxy } = getNPMConfig();
  if (!proxy) { return undefined; }

  const [authPart, hostPart] = proxy.split('@');
  const [, proxyAuth] = authPart.split('//');
  const [host, rawPort] = hostPart.split(':');
  const [port] = rawPort.split('/');

  return {
    host,
    port,
    proxyAuth,
  };
}
