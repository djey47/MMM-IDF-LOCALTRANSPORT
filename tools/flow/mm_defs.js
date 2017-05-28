/* @flow */

// MM2's module item
declare var Module: {
  register(name: string, module: Object): void;
};

// MM2's integrated logging system
declare var Log: {
  info(message: string): void;
  log(message: string): void;
  error(message: string): void;
};
