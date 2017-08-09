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

export type TransilienTrain = {
  date: {
    _: string,
    $: {
      mode: string,
    },
  },
  term: string,
  miss: string,
  etat?: string,
};

export type TransilienPassage = {
  train: Array<TransilienTrain>,
}

export type TransilienResponse = {
  passages: TransilienPassage,
};

export type TransilienStationInfo = {
  stationInfo: {
    libelle: string,
  },
};


export type ServerScheduleResponse = {
  id: string,
  lastUpdate: string,
  schedules: Array<Schedule>,
};

export type StationInfoQuery = {
  index: number,
  stationValue: string,
};

