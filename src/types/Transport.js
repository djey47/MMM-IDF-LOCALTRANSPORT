/* @flow */

/* Module specific defs */

export type Schedule = {
  message?: string,     // TODO deletion: Deprecated
  destination: string,
  status: ?string,      // See support/status.js
  time?: ?string,       // ISO
  timeMode?: string,    // See support/status.js
  code?: ?string,       // Mission code for trains
  info?: ?string,       // Additional information, not applicable for transiliens
};

export type ServerScheduleResponse = {
  id: string,
  lastUpdate: string,
  schedules: Array<Schedule>,
};

export type ServerTrafficResponse = {
  id: string,
  lastUpdate: string,
  loaded: boolean,
  message: string,
  slug: string,
  title: string,
};

export type ServerVelibResponse = {
  id: number,
  lastUpdate: string,
  name: string,
  total: number,
  empty: number,
  bike: number,
  loaded: boolean,
};

export type StationInfoQuery = {
  index: number,
  stationValue: string,
  destinationValue?: ?string,
};

export type StationInfoResult = {
  index: number,
  stationInfo: SNCFStationInfo,
  destinationInfo?: SNCFStationInfo,
};

/* Legacy API defs */

export type LegacySchedule = {
  code?: string,
  message: string,
  destination: string,
};

export type LegacyResponse = {
  _metadata: {
    call: string,
  },  
  result: {
    schedules: Array<LegacySchedule>,
  },
};

export type LegacyTrafficResponse = {
  _metadata: {
    call: string,
  },
  result: {
    message: string,
    slug: string,
    title: string,
  },  
};

/* Transilien API defs */

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

/* SNCF Gares API defs */

export type SNCFStationInfo = {
  code_uic: string,
  libelle: string,
};

/* Velib API defs */

export type VelibResponse = {
  records: [{
    fields: {
      number: number,
      name: string,
      bike_stands: number,
      available_bike_stands: number,
      available_bikes: number,
      last_update: string,      
    }
  }],
};

