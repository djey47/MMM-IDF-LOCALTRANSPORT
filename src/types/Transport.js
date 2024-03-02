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

export type RefDataQuery = {
  stationValue: string,
  destinationValue?: ?string,
  lineValue: string,
};

export type RefDataResponse = {
  lineRef?: string,
  stopAreaRef?: string,
  destinationRef?: string,
};

export type DecodedRef = {
  owner: string,
  type: string,
  subType?: string,
  ref: string,
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
  result: LegacyTrafficInfo,
};

export type LegacyTrafficInfo = {
  line: string,
  message: string,
  slug: string,
  title: string,
};

/* Transilien API defs */

export type TransilienValue = {
  value: string,
}

export type TransilienMonitoredVisit = {
  MonitoredVehicleJourney: {
    DestinationRef: TransilienValue,
    DestinationName: TransilienValue[],
    DirectionName: TransilienValue[],
    JourneyNote: TransilienValue[],
    MonitoredCall: {
      DestinationDisplay: TransilienValue[],
      ExpectedArrivalTime: string,
      ExpectedDepartureTime: string,
      AimedArrivalTime: string,
      ArrivalPlatformName: TransilienValue,
      ArrivalStatus: string,
      VehicleAtStop: boolean,
    },
    TrainNumbers: {
      TrainNumberRef: TransilienValue[],
    }
  }
};

export type TransilienStopMonitoringDelivery = {
  MonitoredStopVisit: Array<TransilienMonitoredVisit>,
};

export type TransilienStopMonitoringResponse = {
  Siri: {
    ServiceDelivery: {
      StopMonitoringDelivery: Array<TransilienStopMonitoringDelivery>,
    }
  }
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

