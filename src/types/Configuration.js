/* @flow */

/** Types for configuration objects */

export type UICConfiguration = {

  station: ?string,
  destination?: ?string,

};

export type StationConfiguration = {

  type?: string,
  label?: string,
  station?: string,
  destination?: string,
  uic?: UICConfiguration, 
  line?: string|Array<number|string>,
  order?: number,

};

export type BlockOrdering = {

  traffic: number,
  schedules: number,
  velib: number,

};

export type ModuleConfiguration = {

  maximumEntries: number, //if the APIs sends several results for the incoming transport how many should be displayed
  maxTimeOffset: number, // Max time in the future for entries
  updateInterval: number, //time in ms between pulling request for new times (update request)
  convertToWaitingTime: boolean, // messages received from API can be 'hh:mm' in that case convert it in the waiting time 'x mn'
  initialLoadDelay: number, // start delay seconds.
  maxLettersForDestination: number, //will limit the length of the destination string
  maxLettersForTime?: number, //will limit the length of the time string
  concatenateArrivals: boolean, //if for a transport there is the same destination and several times, they will be displayed on one line
  showSecondsToNextUpdate: boolean,  // display a countdown to the next update pull (should I wait for a refresh before going ?)
  showLastUpdateTime: boolean,  //display the time when the last pulled occured (taste & color...)
  oldUpdateOpacity: number, //when a displayed time age has reached a threshold their display turns darker (i.e. less reliable)
  oldThreshold: number, //if (1+x) of the updateInterval has passed since the last refresh... then the oldUpdateOpacity is applied
  oldUpdateThreshold?: number, // ???
  debug: boolean, //console.log more things to help debugging
  velibGraphWidth: number, //Height will follow
  velibTrendWidth: number,
  velibTrendHeight: number,
  velibTrendTimeScale: number, // in nb of seconds
  velibTrendZoom: number,
  velibTrendDay: boolean,
  trendGraphOff: boolean,

  apiBaseV3: string,  
  apiTransilien: string,
  apiVelib: string,     // add &q=141111 to get info of that station
  apiAutolib: string,   // add '?q=' but no realtime info... for now
  apiSncfData: string,
  apiCitymapper: string,
  transilienToken: string, // get it from own account @transilien SNCF
  citymapperToken: string,

  stations: Array<StationConfiguration>,

  messages: Object, //{ key1: value1, ... }

  lastUpdate?: string,

  blockOrder: BlockOrdering,
};
