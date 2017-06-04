/* @flow */

import { formatDateFull } from '../support/format';
import Navitia  from '../support/navitia';

type Stop = {
  line: (number|string)[],
  label?: string,
  station: number|string,
  destination?: string,
};

type VelibStation = {
  total: number,
  bike: number,
  empty: number,
  name: string,
};

type Schedule = {
  message: string,
  destination: string
};

type ComingContext = {
  previousMessage: string,
  previousDestination: ?string,
  previousRow: ?any,
};

/**
 * @returns HTML for main wrapper
 */
export const renderWrapper = (loaded: boolean): any => {
  const wrapper = document.createElement('div');

  if (loaded) {
    wrapper.className = 'paristransport';
  } else {
    wrapper.innerHTML = 'Loading connections ...';
    wrapper.className = 'dimmed light small';
  }

  return wrapper;
};

/**
 * @returns module header contents
 */
export const renderHeader = (data: Object, config: Object): string => {
  const { updateInterval, showLastUpdateTime, lastUpdate, showSecondsToNextUpdate } = config;

  let contents = data.header;
  if (showSecondsToNextUpdate) {
    const timeDifference = Math.round((updateInterval - new Date() + Date.parse(lastUpdate)) / 1000);
    if (timeDifference > 0) {
      contents += `, next update in ${timeDifference}s`;
    } else {
      contents += `, update requested ${Math.abs(timeDifference)}s ago`;
    }
  }

  if (showLastUpdateTime) {
    contents += (lastUpdate ? ` @ ${formatDateFull(lastUpdate)}` : '');
  }

  return contents;
};

/**
 * @returns HTML for traffic status
 */
export const renderTraffic = (stop: Stop, ratpTraffic: Object, config: Object): any => {
  const { line, label } = stop;
  const stopIndex = `traffic/${line[0].toString()}/${line[1].toString()}`.toLowerCase();
  const row = document.createElement('tr');

  const firstCell = document.createElement('td');
  firstCell.className = 'align-right bright';
  firstCell.innerHTML = label || line[1].toString();
  row.appendChild(firstCell);

  const trafficAtStop = ratpTraffic[stopIndex];
  const { message } = trafficAtStop ? trafficAtStop : { message: 'N/A' };
  const secondCell = document.createElement('td');
  secondCell.className = 'align-left';
  secondCell.innerHTML = config.conversion[message] || message;
  secondCell.colSpan = 2;
  row.appendChild(secondCell);

  return row;
};

/**
 * @private
 */
export const renderComingTransport = (firstLine: boolean, stop: Stop, comingTransport: Schedule, comingLastUpdate: string, previous: ComingContext, config: Object, now: Date): ?any => {
  const { line, label } = stop;
  const { message, destination } = comingTransport ;
  const row = document.createElement('tr');

  const nameCell = document.createElement('td');
  nameCell.className = 'align-right bright';
  if (firstLine) {
    nameCell.innerHTML = label || line.toString();
  } else {
    nameCell.innerHTML = ' ';
  }
  row.appendChild(nameCell);

  const destinationCell = document.createElement('td');
  destinationCell.innerHTML = destination.substr(0, config.maxLettersForDestination);
  destinationCell.className = 'align-left';
  row.appendChild(destinationCell);

  const depCell = document.createElement('td');
  depCell.className = 'bright';
  if (comingTransport) {
    if (config.convertToWaitingTime && /^\d{1,2}[:][0-5][0-9]$/.test(message)) {
      const transportTime = message.split(':');
      const endDate = new Date(0, 0, 0, Number.parseInt(transportTime[0]), Number.parseInt(transportTime[1]));
      const startDate = new Date(0, 0, 0, now.getHours(), now.getMinutes(), now.getSeconds());
      let waitingTime = endDate - startDate;
      if (startDate > endDate) {
        waitingTime += 1000 * 60 * 60 * 24;
      }
      waitingTime = Math.floor(waitingTime / 1000 / 60);
      depCell.innerHTML = waitingTime + ' mn';
    } else {
      depCell.innerHTML = message;
    }      
  } else {
    depCell.innerHTML = 'N/A ';
  }
  depCell.innerHTML = depCell.innerHTML.substr(0, config.maxLettersForTime);
  row.appendChild(depCell);

  if ((now - Date.parse(comingLastUpdate)) > (config.oldUpdateThreshold ? config.oldUpdateThreshold : (config.updateInterval * (1 + config.oldThreshold)) )) {
    destinationCell.style.opacity = depCell.style.opacity = config.oldUpdateOpacity;
  }

  const { previousDestination, previousRow } = previous;
  if (config.concatenateArrivals 
      && !firstLine 
      && destination === previousDestination) {
    previous.previousMessage += ` / ${message}`;
    if (previousRow) {
      previousRow.getElementsByTagName('td')[2].innerHTML = previous.previousMessage;
    }
    return null;
  } else {
    previous.previousRow = row;
    previous.previousMessage = message;
    previous.previousDestination = destination;
    return row;
  }
};

/**
 * @private
 */
export const createStopIndexFromStopConfig = (config: Object) => {
  const { line, station, destination } = config;
  
  return `${line.toString().toLowerCase()}/${station}/${destination || ''}`;
};

/**
 * @private
 */
export const renderPublicTransport = (stopConfig: Object, stopIndex: string, schedules: Object, lastUpdate: Object, config: Object, now: Date) => {
  const rows = [];
  const coming: Schedule[] = schedules[stopIndex] || [ { message: 'N/A', destination: 'N/A' } ];
  const comingLastUpdate: string = lastUpdate[stopIndex];
  const previous = {
    previousRow: null,
    previousDestination: null,
    previousMessage: '',
  };
  let firstLine = true;
  for (let comingIndex = 0; (comingIndex < config.maximumEntries) && (comingIndex < coming.length); comingIndex++) {
    const row = renderComingTransport(firstLine, stopConfig, coming[comingIndex], comingLastUpdate, previous, config, now);
    if (row) rows.push(row);
    firstLine = false;
  }
  return rows;
};

/**
 * @returns HTML for public transport items (rows) via classical API (Grimaud v3)
 */
export const renderPublicTransportLegacy = (stop: Stop, schedules: Object, lastUpdate: Object, config: Object, now: Date): any[] => {
  const stopIndex = createStopIndexFromStopConfig(stop);

  return renderPublicTransport(stop, stopIndex, schedules, lastUpdate, config, now);
};

/**
 * @returns HTML for public transport items (rows) via Navitia API
 */
export const renderPublicTransportNavitia = (stop: Stop, schedules: Object, lastUpdate: Object, config: Object, now: Date): any[] => {
  const stopIndex = Navitia.createIndexFromStopConfig(stop);

  return renderPublicTransport(stop, stopIndex, schedules, lastUpdate, config, now);  
};

/**
 * @private
 */
export const renderNoInfoVelib = (stop: Stop): any => {
  const { label, station } = stop;
  const row = document.createElement('tr');
  const messageCell = document.createElement('td');

  messageCell.className = 'bright';
  messageCell.innerHTML = `${label || station} no info yet`;
  row.appendChild(messageCell);

  return row;
};

/**
 * @private
 * @returns HTML for info received for Velib (without trend)
 */
export const renderSimpleInfoVelib = (stop: Stop, station: VelibStation): any => {
  const row = document.createElement('tr');
  const { label } = stop;
  const { total, bike, empty, name } = station;
  const velibStationCell = document.createElement('td');
  velibStationCell.className = 'align-left';
  velibStationCell.innerHTML = total.toString();
  row.appendChild(velibStationCell);

  const velibStatusCell = document.createElement('td');
  velibStatusCell.className = 'bright';
  velibStatusCell.innerHTML = `${bike} velibs ${empty} spaces`;
  row.appendChild(velibStatusCell);

  const velibNameCell = document.createElement('td');
  velibNameCell.className = 'align-right';
  velibNameCell.innerHTML = label || name;
  row.appendChild(velibNameCell);

  return row;
};

/**
 * @private
 * @returns HTML for info received for Velib (with trend)
 */
export const renderTrendInfoVelib = (stop: Stop, station: VelibStation, velibHistory: Object, config: Object, now: Date): any => {
  const { name, bike, empty } = station;
  const rowTrend = document.createElement('tr');
  const cellTrend = document.createElement('td');

  const trendGraph = document.createElement('canvas');
  trendGraph.className = 'velibTrendGraph';
  trendGraph.width  = config.velibTrendWidth || 400;
  trendGraph.height = config.velibTrendHeight || 100;

  const timeScale = config.velibTrendDay ? 24 * 60 * 60 : config.velibTrendTimeScale || 60 * 60; // in nb of seconds, the previous hour
  // $FlowFixMe
  trendGraph.timeScale = timeScale;

  const velibTrendZoom = config.velibTrendZoom || 30 * 60; //default zoom windows is 30 minutes for velibTrendDay
  const ctx = trendGraph.getContext('2d');
  if (!ctx) { return rowTrend; }

  const { label } = stop;
  const currentStation = velibHistory[stop.station];
  const { height, width } = trendGraph;
  let previousX = width;
  let inTime = false;
  for (var dataIndex = currentStation.length - 1; dataIndex >= 0 ; dataIndex--) { //start from most recent
    let dataTimeStamp = (now - new Date(currentStation[dataIndex].lastUpdate)) / 1000; // time of the event in seconds ago
    if (dataTimeStamp < timeScale || inTime) {
      inTime = dataTimeStamp < timeScale; // compute the last one outside of the time window
      if (dataTimeStamp - timeScale < 10 * 60) { //takes it only if it is within 10 minutes of the closing windows
        dataTimeStamp = Math.min(dataTimeStamp, timeScale); //to be sure it does not exit the graph
        let x, y;
        if (config.velibTrendDay) {
          if ( dataTimeStamp  < velibTrendZoom ) { //1st third in zoom mode
            x = (1 - dataTimeStamp / velibTrendZoom / 3) * width;
          } else if (dataTimeStamp < timeScale - velibTrendZoom) { //middle in compressed mode
            x = (2 / 3 - (dataTimeStamp - velibTrendZoom) / (timeScale - 2 * velibTrendZoom)/ 3) * width;
          } else {
            x = (1 / 3 - (dataTimeStamp - timeScale + velibTrendZoom)/ velibTrendZoom / 3) * width;
          }
        } else {
          x = (1 - dataTimeStamp / timeScale) * width;
        }
        y = currentStation[dataIndex].bike / currentStation[dataIndex].total * height * 4 / 5;
        ctx.fillStyle = 'white';
        ctx.fillRect(x, height - y - 1, previousX - x, Math.max(y, 1)); //a thin line even if it's zero
        previousX = x;
      }
    }
  }
  ctx.font = Math.round(height / 5) + 'px ' + ctx.font.split(' ').slice(-1)[0];
  ctx.fillStyle = 'grey';
  ctx.textAlign = 'center';
  ctx.fillText(label || name, width / 2, Math.round(height / 5));
  ctx.textAlign = 'left';
  ctx.fillText(bike.toString(), 10, height - 10);
  ctx.fillText(empty.toString(), 10, Math.round(height / 5) + 10);
  if (config.velibTrendDay) {
    ctx.font = Math.round(height / 10) + 'px ' + ctx.font.split(' ').slice(-1)[0];
    ctx.fillText(Math.round(velibTrendZoom / 60) + 'mn', width * 5 / 6, height / 2);
    ctx.fillText(Math.round(velibTrendZoom / 60) + 'mn', width / 6, height / 2);
    ctx.strokeStyle = 'grey';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(2/3 * width, 0);
    ctx.lineTo(2/3 * width, 100);
    ctx.stroke();
    ctx.moveTo(width / 3, 0);
    ctx.lineTo(width / 3, 100);
    ctx.stroke();
    var hourMark = new Date(); var alpha;
    hourMark.setMinutes(0); hourMark.setSeconds(0);
    alpha = (hourMark - now + 24 * 60 * 60 * 1000 - velibTrendZoom * 1000) / (24 * 60 * 60 * 1000 - 2 * velibTrendZoom * 1000);
    alpha = (hourMark - now + velibTrendZoom * 1000) / (24 * 60 * 60 * 1000) * width;
    for (var h = 0; h < 24; h = h + 2) {
      ctx.fillStyle = 'red';
      ctx.textAlign = 'center';
      ctx.font = Math.round(height / 12) + 'px';
      ctx.fillText(`${(hourMark.getHours() + 24 - h) % 24}`, (2 - h / 24) * width / 3 + alpha, h % 12 * height / 12 / 3 + height / 3);
    }
  }
  cellTrend.colSpan = 3; //so that it takes the whole row
  cellTrend.appendChild(trendGraph);
  rowTrend.appendChild(cellTrend);

  return rowTrend;
};

/**
 * @returns HTML for info received for Velib
 */
export const renderVelib = (stop: Stop, velibHistory: Object, config: Object, now: Date): any => {
  const velibStationHistory = velibHistory[stop.station];

  if (!velibStationHistory) {
    return renderNoInfoVelib(stop);
  }

  const stationInfo = velibStationHistory.slice(-1)[0];
  if (config.trendGraphOff) {
    return renderSimpleInfoVelib(stop, stationInfo);
  }

  return renderTrendInfoVelib(stop, stationInfo, velibHistory, config, now);
};
