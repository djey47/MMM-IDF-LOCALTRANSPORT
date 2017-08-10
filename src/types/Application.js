/* @flow */

import type { ModuleConfiguration } from './Configuration';

export type ComingContext = {
  previousDepInfo: string,
  previousDestination: ?string,
  previousRow: ?any,
};

export type NotificationSenderFunction = (notification: string, payload: Object) => void;

export type Context = {
  config: ModuleConfiguration,
  sendSocketNotification: NotificationSenderFunction ,
};
