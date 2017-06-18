/* @flow */

type ModuleConfiguration = {

  maximumEntries: number, //if the APIs sends several results for the incoming transport how many should be displayed
  maxTimeOffset: number, // Max time in the future for entries
  useRealtime: boolean,
  updateInterval: number, //time in ms between pulling request for new times (update request)
  animationSpeed: number,
  convertToWaitingTime: boolean, // messages received from API can be 'hh:mm' in that case convert it in the waiting time 'x mn'
  initialLoadDelay: number, // start delay seconds.
  maxLettersForDestination: number, //will limit the length of the destination string
  concatenateArrivals: boolean, //if for a transport there is the same destination and several times, they will be displayed on one line
  showSecondsToNextUpdate: boolean,  // display a countdown to the next update pull (should I wait for a refresh before going ?)
  showLastUpdateTime: false,  //display the time when the last pulled occured (taste & color...)
  oldUpdateOpacity: number, //when a displayed time age has reached a threshold their display turns darker (i.e. less reliable)
  oldThreshold: number, //if (1+x) of the updateInterval has passed since the last refresh... then the oldUpdateOpacity is applied
  debug: boolean, //console.log more things to help debugging
  velibGraphWidth: number, //Height will follow
  conversion: Object, //{ key1: value1, ... }

  apiBaseV3: string,  
  apiNavitia: string,
  navitiaToken: string, // get it from own account @navitia.io
  apiVelib: string,     // add &q=141111 to get info of that station
  apiAutolib: string,   // add '?q=' but no realtime info... for now

};

export const defaults: ModuleConfiguration = {

  maximumEntries: 2,
  maxTimeOffset: 200,
  useRealtime: true,
  updateInterval: 1 * 60 * 1000,
  animationSpeed: 2000,
  convertToWaitingTime: true,
  initialLoadDelay: 0,
  maxLettersForDestination: 22,
  concatenateArrivals: true,
  showSecondsToNextUpdate: true,
  showLastUpdateTime: false,
  oldUpdateOpacity: 0.5,
  oldThreshold: 0.1,
  debug: false,
  velibGraphWidth: 400,
  conversion: { "Trafic normal sur l'ensemble de la ligne." : 'Traffic OK'},

  apiBaseV3: 'https://api-ratp.pierre-grimaud.fr/v3/',
  apiNavitia: 'https://api.navitia.io/v1/',
  navitiaToken: '00000000-0000-0000-000000000000',
  apiVelib: 'https://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel',
  apiAutolib: 'https://opendata.paris.fr/explore/dataset/stations_et_espaces_autolib_de_la_metropole_parisienne/api/',

  messages: {
    status: {
      approaching: 'Approaching',
    },
  },

};
