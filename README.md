# MMM-IDF-LOCALTRANSPORT
[ ![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](http://choosealicense.com/licenses/mit)
![Build status](https://github.com/djey47/MMM-IDF-LOCALTRANSPORT/actions/workflows/mm2-idf.js.yml/badge.svg?branch=fix%2Ftransilien-2023&event=push)

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
![screenshot](https://github.com/djey47/MMM-IDF-LOCALTRANSPORT/blob/master/images/MMM-IDF-LOCALTRANSPORT-TRANSILIEN-2023.png)

# API
API examples are provided into `api` subdirectory, as [POSTMAN collections](https://www.getpostman.com/).
* RERs, Metros, Buses and Tramways infos are provided by [P.Grimaud's API](https://github.com/pgrimaud/horaires-ratp-api) via RATP services
* Transilien infos are based on the REST API provided by [IDF Mobilités](https://data.iledefrance-mobilites.fr/pages/home/)
* Traffic data for transilien comes from [Citymapper API](https://citymapper.com/paris)
* It also uses [Paris Open Data for Velib](https://opendata.paris.fr/explore/dataset/stations-velib-disponibilites-en-temps-reel/) (use it to get the 5 digits stations you will need for the configuration)

Some infos require FREE subscription to services, see below:

## Citymapper realtime API
To use this API you need to request credentials, please create account [HERE](https://citymapper.3scale.net/).

Once key has been given to you back, you've just to enter it in configuration file for `citymapperToken` value.

## Transilien realtime API with IDF Mobilités
To use this API you need to create an account and request a dynamic token, please submit it [HERE](https://prim.iledefrance-mobilites.fr/fr/mes-jetons-authentification).

Finally, `transilienToken` value to be entered in configuration file will be the generated token value.

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
* [`name`]: [default value], // information
* `maximumEntries`: 2, // if APIs send several results for the incoming transport how many should be displayed. Also applies to concatenated arrivals
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
* `devMode`: false, // uses mocked API responses from dev-server to help with development (see Dev Server below)
* `stations`: [] // stations/directions to monitor (bus, RERs, tramways and subways), as an array of objects with different properties (see example below):
  - `type`: Mandatory: Possible values: `['bus', 'rers', 'tramways', 'velib', 'traffic', 'transiliens', 'transiliensTraffic']`
  - `line`: Mandatory for 'bus', 'rers', and 'tramways': typically the official name but you can check through:
    - 'bus-metros-rers-tramways': https://api-ratp.pierre-grimaud.fr/v3/lines/bus, https://api-ratp.pierre-grimaud.fr/v3/lines/rers, https://api-ratp.pierre-grimaud.fr/v3/lines/tramways, https://api-ratp.pierre-grimaud.fr/v3/lines/metros
    - traffic: https://api-ratp.pierre-grimaud.fr/v3/traffic, set the line as: [type, line], such as: ['metros', 6], ['rers', 'A']...
    - transiliens and transiliensTraffic: set the line as code, such as: 'L', 'J'...
  - `station`: Mandatory: [name of the station] ->
    - for 'bus-rers-tramways-metros', https://api-ratp.pierre-grimaud.fr/v3/stations/{type}/{line}
    - for 'velib', you can search here: https://opendata.paris.fr/explore/dataset/stations-velib-disponibilites-en-temps-reel/
    - for 'transiliens', valid stations names are listed [HERE](https://data.iledefrance-mobilites.fr/explore/dataset/arrets/export/?refine.arrtype=rail) and line names are [HERE](https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/export/?disjunctive.transportmode&disjunctive.transportsubmode&disjunctive.operatorname&disjunctive.networkname&refine.transportmode=rail)
    - not used for 'traffic' and 'transiliensTraffic'.
  - `destination`: 
    - Mandatory for 'metros', 'bus', 'rers' & 'tramways': either 'A' or 'R'
    - Optional for 'velib': ['leaving', 'arriving', '']: indicate if only one value is needed //not in use yet
    - Optional for 'transiliens': shows train matching this destination only (see station repository above)
    - not used for 'traffic' and 'transiliensTraffic'.
  - `transilienRefData`: ('transiliens' only) : reference data codes for line, station (stop area) and destination (useful when names are not sufficient to identify)
    - Optional, if not provided, line, station and destination codes will be resolved from names provided above
    - `lineRef` element: code from 'id_line'
    - `stopAreaRef` element: code from 'zdaid'
    - `destinationRef` element (optional): code fomr 'arrid'
  - `label`: Optional, to rename the line differently if needed.
* `transilienToken`: 'xxxxxxxx' : mandatory to access transilien realtime API (account required, see section above)
* `citymapperToken`: 'xxxxxxxx' : mandatory to access citymapper realtime API (account required, see section above)
* `messages`: (Optional, see example below) : key-values to convert generic messages to your preferred language
  - If not provided, some default messages are used (in english)
  - To make changes, paste ALL default values and modify to your likings. 

Example:
```javascript
transilienToken: 'bG9naW46cGFzc3dvcmQ',

stations: [
  // Next transport at stops (bus, metros, rers, tramways)
  {type: 'bus', line: 38, station: 'observatoire+++port+royal', destination: 'A'},
  {type: 'metros', line: '6', station: 'raspail', destination: 'A'},
  {type: 'rers', line: 'B', station: 'port+royal', destination: 'A'},
  {type: 'tramways', line: '3a', station: 'georges+brassens', destination: 'R'},
  
  // Next transport at stops (transiliens)
  // With station name only to catch all destinations:
  {type: 'transiliens', station: 'BECON LES BRUYERES', label: 'Becon L', line: 'L'},
  // With station and destination names to filter:
  {type: 'transiliens', station: 'BECON LES BRUYERES', destination: 'NANTERRE UNIVERSITE', line 'L'},
  // With reference data codes:
  {type: 'transiliens', station: 'BECON LES BRUYERES', destination: 'SAINT NOM LA BRETECHE', transilienRefData: { lineRef: 'C01740', stopAreaRef: '87382002', destinationRef: '471811'} },

  // Traffic status (bus, metros, rers, tramways)
  {type: 'traffic', line: ['rers', 'B']},
  // Label to avoid confusion with metros line 1:
  {type: 'traffic', line: ['tramways', 1], label: 'T1'},

  // Traffic status (transiliens)
  {type: 'transiliensTraffic', line: 'L'},

  // Velib station infos
  {type: 'velib', station: 5029, destination: 'leaving', label: 'RER'},
],

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
}
```

# Dev server

When running module with *devMode* set to `true`, calls to API will automatically use pre-made responses, located as JSON/JS files under **tools/dev-server/mocks** folder.

This feature helps module developer with simulating some cases, or working when no internet connexion is available.

To get the benefits of this mode, dev server has to be started first. Type `npm run dev-server` or `yarn dev-server`. Then start MM2 with proper configuration.

Once started, dev server listens to requests on http://localhost:8088/.
