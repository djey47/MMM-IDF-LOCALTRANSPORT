/* @flow */

/* Module specific defs */

export type Schedule = {
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
  message?: string,
  summary: string,
  status: string,
  line: string,
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
  destinationInfo?: ?SNCFStationInfo,
};

export type StationInfoHandlerFunction = (resolve: Function, reject: Function) => void;

export type StationInfoResolverFunction = (stationInfo: ?StationInfoResult) => void;

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
  result: LegacyTrafficInfo,
};

export type LegacyTrafficInfo = {
  line: string,
  message: string,
  slug: string,
  title: string,
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

export type SNCFStationRecord = {
  fields: SNCFStationInfo,
};

export type SNCFStationResponse = {
  data: {
    records: Array<SNCFStationRecord>,
  },
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

/* Navitia API defs */

export type NavitiaLineInfo = {
  code: string,
};

export type NavitiaLinesResponse = {
  lines: Array<NavitiaLineInfo>,
};

/* Citymapper API defs */

export type CMRouteInfo = {
  status: {
    summary: string,
    description?: string,
    level: number,
  },
  name: string,
}

export type CMRouteInfoResponse = {
  routes: Array<CMRouteInfo>,
}

