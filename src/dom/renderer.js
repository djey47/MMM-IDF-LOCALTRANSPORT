/* @flow */

import { formatDateFull } from '../support/format';

type Stop = {
  line: (number|string)[],
  label?: string,
  stations: string,
};

type Station = {
  total: number,
  bike: number,
  empty: number,
  name: string,
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
      contents = `, next update in ${timeDifference}s`;
    } else {
      contents = `, update requested ${Math.abs(timeDifference)}s ago`;
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
  const stopIndex = `traffic/${stop.line[0].toString().toLowerCase()}/${stop.line[1].toString().toLowerCase()}`;
  const row = document.createElement('tr');

  const firstCell = document.createElement('td');
  firstCell.className = 'align-right bright';
  firstCell.innerHTML = stop.label || stop.line[1].toString();
  row.appendChild(firstCell);

  const { message } = ratpTraffic[stopIndex] ? ratpTraffic[stopIndex] : { message: 'N/A' };
  const secondCell = document.createElement('td');
  secondCell.className = 'align-left';
  secondCell.innerHTML = config.conversion[message] || message;
  secondCell.colSpan = 2;
  row.appendChild(secondCell);

  return row;
};

/**
 * @private
 * @returns HTML for no info received for Velib
 */
export const renderNoInfoVelib = (stop: Stop): any => {
  const row = document.createElement('tr');
  const messageCell = document.createElement('td');
  messageCell.className = 'bright';
  messageCell.innerHTML = `${stop.label || stop.stations} no info yet`;
  row.appendChild(messageCell);

  return row;
};

/**
 * @private
 * @returns HTML for info received for Velib (without trend)
 */
export const renderSimpleInfoVelib = (stop: Stop, station: Station): any => {
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
export const renderTrendInfoVelib = (stop: Stop, station: Station, velibHistory: Object, config: Object, now: Date): any => {
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

  const { stations } = stop;
  const currentStation = velibHistory[stations];
  let previousX = trendGraph.width;
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
            x = (1 - dataTimeStamp / velibTrendZoom / 3) * trendGraph.width;
          } else if (dataTimeStamp < timeScale - velibTrendZoom) { //middle in compressed mode
            x = (2 / 3 - (dataTimeStamp - velibTrendZoom) / (timeScale - 2 * velibTrendZoom)/ 3) * trendGraph.width;
          } else {
            x = (1 / 3 - (dataTimeStamp - timeScale + velibTrendZoom)/ velibTrendZoom / 3) * trendGraph.width;
          }
        } else {
          x = (1 - dataTimeStamp / timeScale) * trendGraph.width;
        }
        y = currentStation[dataIndex].bike / currentStation[dataIndex].total * trendGraph.height * 4 / 5;
        ctx.fillStyle = 'white';
        ctx.fillRect(x, trendGraph.height - y - 1, previousX - x, Math.max(y, 1)); //a thin line even if it's zero
        previousX = x;
      }
    }
  }
  ctx.font = Math.round(trendGraph.height / 5) + 'px ' + ctx.font.split(' ').slice(-1)[0];
  ctx.fillStyle = 'grey';
  ctx.textAlign = 'center';
  ctx.fillText(stop.label || station.name, trendGraph.width / 2, Math.round(trendGraph.height / 5));
  ctx.textAlign = 'left';
  ctx.fillText(station.bike.toString(), 10, trendGraph.height - 10);
  ctx.fillText(station.empty.toString(), 10, Math.round(trendGraph.height / 5) + 10);
  if (config.velibTrendDay) {
    ctx.font = Math.round(trendGraph.height / 10) + 'px ' + ctx.font.split(' ').slice(-1)[0];
    ctx.fillText(Math.round(velibTrendZoom / 60) + 'mn', trendGraph.width * 5 / 6, trendGraph.height / 2);
    ctx.fillText(Math.round(velibTrendZoom / 60) + 'mn', trendGraph.width / 6, trendGraph.height / 2);
    ctx.strokeStyle = 'grey';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(2/3 * trendGraph.width, 0);
    ctx.lineTo(2/3 * trendGraph.width, 100);
    ctx.stroke();
    ctx.moveTo(trendGraph.width / 3, 0);
    ctx.lineTo(trendGraph.width / 3, 100);
    ctx.stroke();
    var hourMark = new Date(); var alpha;
    hourMark.setMinutes(0); hourMark.setSeconds(0);
    alpha = (hourMark - now + 24 * 60 * 60 * 1000 - velibTrendZoom * 1000) / (24 * 60 * 60 * 1000 - 2 * velibTrendZoom * 1000);
    alpha = (hourMark - now + velibTrendZoom * 1000) / (24 * 60 * 60 * 1000) * trendGraph.width;
    for (var h = 0; h < 24; h = h + 2) {
      ctx.fillStyle = 'red';
      ctx.textAlign = 'center';
      ctx.font = Math.round(trendGraph.height / 12) + 'px';
      ctx.fillText(`${(hourMark.getHours() + 24 - h) % 24}`, (2 - h / 24) * trendGraph.width / 3 + alpha, h % 12 * trendGraph.height / 12 / 3 + trendGraph.height / 3);
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
  const { stations } = stop;

  if (!velibHistory[stations]) {
    return renderNoInfoVelib(stop);
  }

  const station = velibHistory[stations].slice(-1)[0];
  if (config.trendGraphOff) {
    return renderSimpleInfoVelib(stop, station);
  }

  return renderTrendInfoVelib(stop, station, velibHistory, config, now);
};
