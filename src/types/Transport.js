/* @flow */

export type Schedule = {
  message?: string,     // TODO deletion: Deprecated
  destination: string,
  status: ?string,      // See support/status.js
  time?: ?string,       // ISO
  timeMode?: string,    // See support/status.js
  code?: ?string,       // Mission code for trains
  info?: ?string,       // Additional information, not applicable for transiliens
};

type LegacyResult = {
  schedules: Array<LegacySchedule>,
};

export type LegacySchedule = {
  code?: string,
  message: string,
  destination: string,
};

export type LegacyResponse = {
  result: LegacyResult,
};

export type ServerScheduleResponse = {
  id?: string,
  lastUpdate?: string,
  schedules?: Array<Schedule>,
};
