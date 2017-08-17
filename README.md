# MMM-IDF-LOCALTRANSPORT
[ ![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](http://choosealicense.com/licenses/mit)
[ ![Codeship Status for djey47/MMM-IDF-LOCALTRANSPORT](https://app.codeship.com/projects/323491f0-25bd-0135-db38-2a42d49cc1d5/status?branch=master)](https://app.codeship.com/projects/222476)

MichMich's MagicMirror2 module to display next transportation means for a configured list of stations/destinations.

Forked from MMM-Paris-RATP-PG see more detailed information on [github](https://github.com/da4throux/MMM-Paris-RATP-PG).

# Presentation
A module to display:
* the different buses, metros, rers, tramways & transiliens, in order to avoid waiting too much for them when leaving home
* general traffic information for lines of metros, rers, tramways & transiliens
* available docks & bikes in selected Velib stations, along with the trend over the last day (configurable).

# Screenshots
![screenshot](https://github.com/djey47/MMM-IDF-LOCALTRANSPORT/blob/master/images/MMM-IDF-LOCALTRANSPORT1.png)
![screenshot](https://github.com/djey47/MMM-IDF-LOCALTRANSPORT/blob/master/images/MMM-IDF-LOCALTRANSPORT2.png)

# API
API examples are provided into `api` subdirectory, as [POSTMAN collections](https://www.getpostman.com/).
* RERs, Metros, Buses and Tramways infos are provided by [P.Grimaud's API](https://github.com/pgrimaud/horaires-ratp-api) via RATP services
* Transilien infos are based on the REST API provided by [TRANSILIEN](https://ressources.data.sncf.com/explore/dataset/api-temps-reel-transilien/) and [SNCF](https://ressources.data.sncf.com)
* Traffic data for transilien comes from [Citymapper API](https://citymapper.com/paris)
* It also uses [Paris Open Data for Velib](https://opendata.paris.fr/explore/dataset/stations-velib-disponibilites-en-temps-reel/) (use it to get the 5 digits stations you will need for the configuration)

Some infos require FREE subscription to services, see below:

## Citymapper realtime API
To use this API you need to request credentials, please create account [HERE](https://citymapper.3scale.net/).

Once key has been given to you back, you've just to enter it in configuration file for `citymapperToken` value.

## Transilien realtime API
To use this API you need to request credentials, please ask by sending email [HERE](mailto:innovation-transilien@sncf.fr?subject=Demande%20acc%C3%A8s%20API%20prochains%20d%C3%A9parts&body=nom,%20pr%C3%A9nom,organisation,utilisation).

Once login/password have been given to you back, generate token value: open a browser window, press F12 and execute following code in console: `window.btoa(unescape(encodeURIComponent('LOGIN:PASSWORD')))`. Copy result to clipboard.

Finally, `transilienToken` value to be entered in configuration file will be `Basic <pasted value from keyboard>`.

# Install

1. Clone repository into `/modules/` inside your MagicMirror folder
2. Install [yarn](https://yarnpkg.com/en/docs/install)
3. Run `yarn install` inside `/modules/MMM-IDF-LOCALTRANSPORT/` folder
4. Check that `MMM-IDF-LOCALTRANSPORT.js` and `node_helper.js` scripts have been created into current folder
5. Add the module to the MagicMirror config:
```
		{
	        module: 'MMM-IDF-LOCALTRANSPORT',
	        position: 'bottom_right',
	        header: 'Connections',
	        config: { // see below }
    	},
```
6. Make sure all required API keys have been acquired (see previous chapter).

# Specific configuration
* [`name`]: [default value], //information
* `maximumEntries`: 2, //if the APIs sends several results for the incoming transport how many should be displayed
* `initialLoadDelay`: 0, //time in ms before first request
* `updateInterval`: 60000, //time in ms between pulling request for new times (update request)
* `convertToWaitingTime`: true, // messages received from API can be 'hh:mm' in that case convert it in the waiting time 'x mn'
* `maxLettersForDestination`: 22, //will limit the length of the destination string
* `concatenateArrivals`: true, //if for a transport there is the same destination and several times, they will be displayed on one line
* `showSecondsToNextUpdate`: true, // display a countdown to the next update pull (should I wait for a refresh before going ?)
* `showLastUpdateTime`: false, //display the time when the last pulled occured (taste & color...)
* `oldUpdateOpacity`: 0.5, //when a displayed time age has reached a threshold their display turns darker (i.e. less reliable)
* `oldThreshold`: 0.1, //if (1+x) of the updateInterval has passed since the last refresh... then the oldUpdateOpacity is applied
* `debug`: false, //console.log more things to help debugging
* `stations`: [] // stations/directions to monitor (bus, RERs, tramways and subways), as an array of objects with different properties (see example below):
  - `type`: Mandatory: Possible values: `['bus', 'rers', 'tramways', 'velib', 'traffic', 'transiliens', 'transiliensTraffic']`
  - `line`: Mandatory for 'bus', 'rers', and 'tramways': typically the official name but you can check through:
    - 'bus-metros-rers-tramways': https://api-ratp.pierre-grimaud.fr/v3/lines/bus, https://api-ratp.pierre-grimaud.fr/v3/lines/rers, https://api-ratp.pierre-grimaud.fr/v3/lines/tramways, https://api-ratp.pierre-grimaud.fr/v3/lines/metros
    - traffic: https://api-ratp.pierre-grimaud.fr/v3/traffic, set the line as: [type, line], such as: ['metros', 6], ['rers', 'A']...
    - transiliensTraffic: set the line as code, such as: 'L', 'J'...
    - not used for 'transiliens'.
  - `station`: Mandatory: [name of the station] ->
    - for 'bus-rers-tramways-metros', https://api-ratp.pierre-grimaud.fr/v3/stations/{type}/{line}
    - for 'velib', you can search here: https://opendata.paris.fr/explore/dataset/stations-velib-disponibilites-en-temps-reel/
    - for 'transiliens', https://ressources.data.sncf.com/explore/dataset/referentiel-gares-voyageurs/?sort=intitule_gare
    - not used for 'traffic'.
  - `destination`: 
    - Mandatory for 'metros', 'bus', 'rers' & 'tramways': either 'A' or 'R'
    - Optional for 'velib': ['leaving', 'arriving', '']: indicate if only one value is needed //not in use yet
    - Optional for 'transiliens': shows train matching this destination only (see station repository above)
    - not used for 'traffic' and 'transiliensTraffic'.
  - `uic`: ('transiliens' only) : UIC codes for station and destination (useful when names are not sufficient to identify)
    - Optional, if not provided, station and destination codes will be resolved from names provided above
    - `station` element: code
    - `destination` element (optional): code
  - `label`: Optional, to rename the line differently if needed.
* `transilienToken`: 'Basic xxxxxxxx' : mandatory to access transilien realtime API (account required, see section above)
* `citymapperToken`: 'xxxxxxxx' : mandatory to access citymapper realtime API (account required, see section above)
* `messages`: (see example below) : key-values to convert generic messages to your preferred language.
  - Copy paste all default values and modify to your likings. 

Example:
```javascript
transilienToken: 'Basic bG9naW46cGFzc3dvcmQ=',

stations: [
  // Legacy API
  {type: 'bus', line: 38, station: 'observatoire+++port+royal', destination: 'A'},
  {type: 'rers', line: 'B', station: 'port+royal', destination: 'A'},
  {type: 'traffic', line: ['rers', 'B']},
  // Label to avoid confusion with metros line 1:
  {type: 'traffic', line: ['tramways', 1], label: 'T1'},
  {type: 'tramways', line: '3a', station: 'georges+brassens', destination: 'R'},
  {type: 'metros', line: '6', station: 'raspail', destination: 'A'},
  {type: 'velib', station: 5029, destination: 'leaving', label: 'RER'},
  
  // SNCF Transilien API
  // With station name only to catch all destinations:
  {type: 'transiliens', station: 'BECON LES BRUYERES', label: 'Becon L'},
  // With station and destination names to filter:
  {type: 'transiliens', station: 'BECON LES BRUYERES', label: 'Becon L', destination: 'NANTERRE UNIVERSITE'},
  // With UIC codes:
  {type: 'transiliens', station: 'BECON LES BRUYERES', destination: 'SAINT NOM LA BRETECHE', uic: { station: '87382002', destination: '87382481'}, label: 'Becon L'},

  // SNCF Transilien Traffic via Citymapper API
  {type: 'transiliensTraffic', line: 'L'},
],

messages: {
  messages: {
    ago: 'ago',
    loading: 'Loading connections ...',
    notYet: 'no info yet',
    nextUpdate: 'next update in',
    requestedUpdate: 'update requested',
    unavailable: '-',
    theorical: '?',
    status: {
      approaching: 'Approaching',
      atplatform: 'At platform',
      atstop: 'At stop',
      ontime: '😊⏲',
      deleted: '😞❌',
      delayed: '😐⏳',
      skipped: '❌',
      terminal: '❌ term',
    },
    traffic: {
      ok: '😊',
      okwork: '😐',
      ko: '😞',
    },    
    units: {
      minutes: 'mn',
      seconds: 's',
    },
    velib: {
      bikes: 'velibs',
      spaces: 'spaces',
    },
  },
}
```
