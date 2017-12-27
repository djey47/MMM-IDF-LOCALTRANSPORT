/* @flow */

import type { ModuleConfiguration } from './Configuration';

export type Data = {
  header: string,
};

export type ComingContext = {
  previousDestination: ?string,
  itemListElement: ?any,
  previousDepItems: Array<any>,
};

export type NotificationSenderFunction = (notification: string, payload: Object) => void;

export type Context = {
  loaded: boolean,
  started?: boolean,
  config: ModuleConfiguration,
  sendSocketNotification: NotificationSenderFunction,
};
