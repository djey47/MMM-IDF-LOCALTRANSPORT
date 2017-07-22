# MMM-IDF-STIF-NAVITIA
[ ![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](http://choosealicense.com/licenses/mit)
[ ![Codeship Status for djey47/MMM-IDF-STIF-NAVITIA](https://app.codeship.com/projects/323491f0-25bd-0135-db38-2a42d49cc1d5/status?branch=master)](https://app.codeship.com/projects/222476)

MichMich's MagicMirror2 module to display next transportation means for a configured list of stations/ destinations:

Forked from MMM-Paris-RATP-PG see more detailed information on [github](https://github.com/da4throux/MMM-Paris-RATP-PG).

# Presentation
A module to display:
* the different buses, metros, rers & tramways, in order to avoid waiting too much for them when leaving home. 
* general traffic information for lines of metros, rers & tramways
* available docks & bikes in selected Velib stations, along with the trend over the last day (configurable).

# Screenshot
(obsolete)
![screenshot](https://github.com/da4throux/MMM-Paris-RATP-PG/blob/master/MMM-Paris-RATP-PG2.png)

# API
* It is based on the REST API provided by [NAVITIA](https://www.navitia.io/)
* It also uses [Paris Open Data for Velib](https://opendata.paris.fr/explore/dataset/stations-velib-disponibilites-en-temps-reel/) (use it to get the 5 digits stations you will need for the configuration)
* API examples are provided into `api` subdirectory, as [POSTMAN collections](https://www.getpostman.com/).

# Install

1. Clone repository into `/modules/` inside your MagicMirror folder
2. Install [yarn](https://yarnpkg.com/en/docs/install)
3. Run `yarn install` inside `/modules/MMM-IDF-STIF-NAVITIA/` folder
4. Run `yarn build` inside `/modules/MMM-IDF-STIF-NAVITIA/` folder
5. Check that `/modules/MMM-IDF-STIF-NAVITIA/MMM-IDF-STIF-NAVITIA.js` script has been created
6. Add the module to the MagicMirror config:
```
		{
	        module: 'MMM-IDF-STIF-NAVITIA',
	        position: 'bottom_right',
	        header: 'Connections',
	        config: {
            // see below
	        }
    	},
```

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
  - `type`: Mandatory: Possible values: `['bus', 'rers', 'tramways', 'velib', 'traffic', 'transiliens']`
  - `line`: Mandatory for 'bus', 'rers', and 'tramways': typically the official name but you can check through:
    - 'bus-metros-rers-tramways': https://api-ratp.pierre-grimaud.fr/v3/lines/bus, https://api-ratp.pierre-grimaud.fr/v3/lines/rers, https://api-ratp.pierre-grimaud.fr/v3/lines/tramways, https://api-ratp.pierre-grimaud.fr/v3/lines/metros
    - traffic: https://api-ratp.pierre-grimaud.fr/v3/traffic, set the line as: [type, line], such as: ['metros', 6], ['rers', 'A']...
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
    - not used for 'traffic'.
  - `label`: Optional, to rename the line differently if needed.
* `conversion`: object of key/ values to convert traffic message. Those message can be very long, and it might worth to convert them in a simpler text. by default:
  - `conversion: {"Trafic normal sur l'ensemble de la ligne." : "Traffic normal"}`
  - don't hesitate to add more when there's works on a specific line or others...
* `navitiaToken`: '00000000-0000-0000-000000000000' // Mandatory to access navitia.io API (account required)
* `messages`: key-values to convert generic messages to your preferred language. See example below. 

Example:
```javascript
stations: [
  {type: 'bus', line: 38, station: 'observatoire+++port+royal', destination: 'A'},
  {type: 'rers', line: 'B', station: 'port+royal', destination: 'A'},
  {type: 'traffic', line: ['rers', 'B']},
  {type: 'traffic', line: ['tramways', 1], label: 'T1'}, //label to avoid confusion with metros line 1
  {type: 'tramways', line: '3a', station: 'georges+brassens', destination: 'R'},
  {type: 'metros', line: '6', station: 'raspail', destination: 'A'},
  {type: 'velib', station: 5029, destination: 'leaving', label: 'RER'},
  {type: 'transiliens', station: 'BECON LES BRUYERES', label: 'Becon L', destination: 'NANTERRE UNIVERSITE'},
],
messages: {
  status: {
    approaching: 'Approaching'
  }
}
```
