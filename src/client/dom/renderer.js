/* @flow */

import moment from 'moment-timezone';
import classnames from 'classnames';

import type Moment from 'moment';

import { toHoursMinutesSeconds, toWaitingTime, toHoursMinutes } from '../support/format';
import { now } from '../support/date';
import { translate, MessageKeys } from '../../support/messages';
import CitymapperApi  from '../../support/api/citymapper';
import LegacyApi  from '../../support/api/legacy';
import Transilien  from '../../support/api/transilien';
import {
  Status,
  TrafficStatus,
  TimeModes,
  MessageKeys as StatusMessageKeys,
  TrafficMessageKeys as TrafficStatusMessageKeys,
}  from '../../support/status';

import type { Data, ComingContext } from '../../types/Application';
import type { ModuleConfiguration, StationConfiguration } from '../../types/Configuration';
import type { Schedule, ServerVelibResponse, ServerTrafficResponse } from '../../types/Transport';

/** Table cells configuration */
const CELLS_COUNT = 4;
const INDEX_STATUS = 3;

/**
 * @returns HTML for main wrapper
 */
export const renderWrapper = (loaded: boolean, messages?: Object): any => {
  const wrapper = document.createElement('div');

  if (loaded) {
    wrapper.className = 'IDFTransportWrapper';
  } else {
    wrapper.innerHTML = translate(MessageKeys.LOADING, messages);
    wrapper.className = classnames('dimmed', 'light', 'small');
  }

  return wrapper;
};

/**
 * @returns module header contents
 */
export const renderHeader = (data: Data, config: ModuleConfiguration): string => {
  const { updateInterval, showLastUpdateTime, lastUpdate, showSecondsToNextUpdate, messages } = config;

  let contents = data.header;
  if (showSecondsToNextUpdate) {
    const timeDifference = lastUpdate ? Math.round((updateInterval - now().valueOf() + moment(lastUpdate).valueOf()) / 1000) : 0;
    const secondUnit = translate(MessageKeys.UNITS_SECONDS, messages);
    if (timeDifference > 0) {
      contents += `, ${translate(MessageKeys.NEXT_UPDATE, messages)} ${timeDifference}${secondUnit}`;
    } else if (timeDifference < 0) {
      // TODO when is it supposed to happen? => add unit test if necessary
      contents += `, ${translate(MessageKeys.REQ_UPDATE, messages)} ${Math.abs(timeDifference)}${secondUnit} ${translate(MessageKeys.AGO, messages)}`;
    }
  }

  if (showLastUpdateTime) {
    contents += (lastUpdate ? ` @ ${toHoursMinutesSeconds(lastUpdate)}` : '');
  }

  return contents;
};

/**
 * @private
 */
const resolveLine = (line: ?Array<string|number>|?string): ?string => {
  if (line && typeof(line) === 'object') {
    return line.length === 2 ? line[1].toString() : null;
  } else if (line) {
    return line.toString();
  }
  return null;
};

/**
 * @private
 */
const resolveStatus = (statusCode: ?string, messages: Object, statusMessageKeys: Object): string => {
  if (!statusCode) return '';

  const key = statusMessageKeys[statusCode];
  return key && translate(key, messages) || translate(MessageKeys.UNAVAILABLE, messages);
};

/**
 * @private
 */
const resolveName = (firstLine: boolean, stop: StationConfiguration, messages: Object): string => {
  const { line, label, station } = stop;

  if (!firstLine) return ' ';

  if (label) return label;

  if (line) return line.toString();

  if (station) return station.toString();

  return translate(MessageKeys.UNAVAILABLE, messages);
};

/**
 * @private
 */
const renderTraffic = (trafficIndex: ?string, stop: StationConfiguration, traffic: Object, config: ModuleConfiguration): any => {
  const { messages } = config;
  const unavailableLabel = translate(MessageKeys.UNAVAILABLE, messages);
  
  const row = document.createElement('tr');

  const { line, label } = stop;
  const trafficAtStop: ServerTrafficResponse = traffic[trafficIndex];
  const { status, summary, message } = trafficAtStop ? trafficAtStop : { message: unavailableLabel, status: TrafficStatus.UNKNOWN, summary: unavailableLabel };

  row.className = classnames('Traffic__item', 'bright', {
    'is-ok': status === TrafficStatus.OK,
    'is-ok-with-work': status === TrafficStatus.OK_WORK,
    'is-ko': status === TrafficStatus.KO,
  });

  const labelCell = document.createElement('td');
  labelCell.className = classnames('align-right');
  labelCell.innerHTML = label || resolveLine(line) || unavailableLabel;
  row.appendChild(labelCell);

  const statusCell = document.createElement('td');
  statusCell.innerHTML = resolveStatus(status, messages, TrafficStatusMessageKeys);
  row.appendChild(statusCell);

  const messageCell = document.createElement('td');
  const summaryPart = document.createElement('span');
  summaryPart.innerHTML = summary || unavailableLabel;
  summaryPart.className = 'Traffic__title';
  const messagePart = document.createElement('marquee');
  messagePart.innerHTML = message || '';
  messagePart.className = 'Traffic__message',
  messagePart.setAttribute('scrollamount', '20');
  messagePart.setAttribute('scrolldelay', '300');
  messageCell.appendChild(summaryPart);
  messageCell.appendChild(messagePart);
  messageCell.className = 'align-left';
  messageCell.colSpan = 2;
  row.appendChild(messageCell);

  return row;
};

/**
 * @returns HTML for traffic status (legacy)
 */
export const renderTrafficLegacy = (stop: StationConfiguration, ratpTraffic: Object, config: ModuleConfiguration): any => {
  const trafficIndex = LegacyApi.createTrafficIndexFromStopConfig(stop);
  return renderTraffic(trafficIndex, stop, ratpTraffic, config);
};

/**
 * @returns HTML for traffic status (transiliens via city mapper)
 */
export const renderTrafficTransilien = (stop: StationConfiguration, transilienTraffic: Object, config: ModuleConfiguration): any => {
  const trafficIndex = CitymapperApi.createTrafficIndexFromStopConfig(stop);
  return renderTraffic(trafficIndex, stop, transilienTraffic, config);
};

/**
 * @private
 */
const renderComingTransport = (firstLine: boolean, stop: StationConfiguration, comingTransport: Schedule, comingLastUpdate: Moment, previous: ComingContext, config: ModuleConfiguration): ?any => {
  const { messages, concatenateArrivals, convertToWaitingTime, maxLettersForDestination, maxLettersForTime, oldUpdateThreshold, updateInterval, oldThreshold, oldUpdateOpacity } = config;
  const nowMoment = now();

  const row = document.createElement('tr');

  const nameCell = document.createElement('td');
  nameCell.className = classnames('align-right');
  nameCell.innerHTML = resolveName(firstLine, stop, messages);
  row.appendChild(nameCell);

  if(!comingTransport) return row;

  const {
    status,
    destination,
    time,
    timeMode,
    code,
  } = comingTransport;

  row.className = classnames('Schedules__item', 'bright', {
    'is-delayed': status === Status.DELAYED,
    'is-deleted': status === Status.DELETED,
    'is-ontime': status === Status.ON_TIME,
  });

  const destinationCell = document.createElement('td');
  destinationCell.innerHTML = destination.substr(0, maxLettersForDestination);
  destinationCell.className = 'align-left';
  row.appendChild(destinationCell);

  const statCell = document.createElement('td');
  statCell.innerHTML = `${code || ''} ${resolveStatus(status, messages, StatusMessageKeys)}`.trim();
  row.appendChild(statCell);

  const depCell = document.createElement('td');
  depCell.className = '';  
  let depInfo;
  if (!time) {
    depInfo = translate(MessageKeys.UNAVAILABLE, messages);
  } else if (convertToWaitingTime) {
    depInfo = toWaitingTime(time, nowMoment, messages);
  } else {
    depInfo = toHoursMinutes(time);
  }
  const theoricalSuffix = timeMode === TimeModes.THEORICAL ? translate(MessageKeys.THEORICAL, messages) : '';
  depCell.innerHTML = depInfo.concat(theoricalSuffix).substr(0, maxLettersForTime);
  row.appendChild(depCell);

  const effectiveThreshold = oldUpdateThreshold ? oldUpdateThreshold : updateInterval * (1 + oldThreshold);
  if (nowMoment.subtract(comingLastUpdate).valueOf() > effectiveThreshold) {
    destinationCell.style.opacity = depCell.style.opacity = oldUpdateOpacity.toString();
  }

  const { previousDestination, previousRow } = previous;
  if (concatenateArrivals 
      && !firstLine 
      && destination === previousDestination) {
    previous.previousDepInfo += ` / ${depInfo}`;
    if (previousRow) {
      previousRow.getElementsByTagName('td')[INDEX_STATUS].innerHTML = previous.previousDepInfo;
    }
    return null;
  } else {
    previous.previousRow = row;
    previous.previousDepInfo = depInfo;
    previous.previousDestination = destination;
    return row;
  }
};

/**
 * @returns HTML for public transport items (rows) for any API
 */
export const renderPublicTransport = (stop: StationConfiguration, stopIndex: ?string, schedules: Object, lastUpdate: Object, config: ModuleConfiguration) => {
  const { maximumEntries, messages } = config;
  const rows = [];
  const unavailableLabel = translate(MessageKeys.UNAVAILABLE, messages);
  const coming: Array<Schedule> = schedules[stopIndex] || [ {
    message: unavailableLabel,
    destination: unavailableLabel,
    code: null,
    status: null,
    timeMode: TimeModes.UNDEFINED,
    time: null,
  } ];
  const comingLastUpdate: Moment = lastUpdate[stopIndex];
  const previous: ComingContext = {
    previousRow: null,
    previousDestination: null,
    previousDepInfo: '',
  };
  let firstLine = true;
  for (let comingIndex = 0; (comingIndex < maximumEntries) && (comingIndex < coming.length); comingIndex++) {
    const row = renderComingTransport(firstLine, stop, coming[comingIndex], comingLastUpdate, previous, config);
    if (row) rows.push(row);
    firstLine = false;
  }
  return rows;
};

/**
 * @returns HTML for public transport items (rows) via classical API (Grimaud v3)
 */
export const renderPublicTransportLegacy = (stop: StationConfiguration, schedules: Object, lastUpdate: Object, config: ModuleConfiguration): any[] => {
  const stopIndex = LegacyApi.createIndexFromStopConfig(stop);

  return renderPublicTransport(stop, stopIndex, schedules, lastUpdate, config);
};

/**
 * @returns HTML for public transport items (rows) via Transilien API
 */
export const renderPublicTransportTransilien = (stop: StationConfiguration, schedules: Object, lastUpdate: Object, config: ModuleConfiguration): any[] => {
  const stopIndex = Transilien.createIndexFromStopConfig(stop);

  return renderPublicTransport(stop, stopIndex, schedules, lastUpdate, config);  
};

/**
 * @private
 */
export const renderNoInfoVelib = (stop: StationConfiguration, messages?: Object): any => {
  const { label, station } = stop;
  const row = document.createElement('tr');
  
  const messageCell = document.createElement('td');
  messageCell.className = 'bright';
  messageCell.innerHTML = `${label || station || MessageKeys.UNAVAILABLE} ${translate(MessageKeys.NOT_YET, messages)}`;
  row.appendChild(messageCell);

  return row;
};

/**
 * @private
 * @returns HTML for info received for Velib (without trend)
 */
export const renderSimpleInfoVelib = (stop: StationConfiguration, station: ServerVelibResponse, messages: Object): any => {
  const row = document.createElement('tr');
  const { label } = stop;
  const { total, bike, empty, name } = station;
  const velibStationCell = document.createElement('td');
  velibStationCell.className = 'align-left';
  velibStationCell.innerHTML = total.toString();
  row.appendChild(velibStationCell);

  const velibStatusCell = document.createElement('td');
  velibStatusCell.className = 'bright';
  velibStatusCell.innerHTML = `${bike} ${translate(MessageKeys.VELIB_BIKES, messages)} ${empty} ${translate(MessageKeys.VELIB_SPACES, messages)}`;
  row.appendChild(velibStatusCell);

  const velibNameCell = document.createElement('td');
  velibNameCell.className = 'align-right';
  velibNameCell.innerHTML = label || name;
  row.appendChild(velibNameCell);

  const velibEmptyCell = document.createElement('td');
  row.appendChild(velibEmptyCell);

  return row;
};

/**
 * @private
 * @returns HTML for info received for Velib (with trend)
 */
export const renderTrendInfoVelib = (stop: StationConfiguration, station: ServerVelibResponse, velibHistory: Object, config: ModuleConfiguration): any => {
  const { name, bike, empty } = station;
  const { velibTrendWidth, velibTrendHeight, velibTrendTimeScale, velibTrendZoom, velibTrendDay } = config;
  const rowTrend = document.createElement('tr');
  const cellTrend = document.createElement('td');

  const trendGraph = document.createElement('canvas');
  trendGraph.className = 'velibTrendGraph';
  trendGraph.width  = velibTrendWidth;
  trendGraph.height = velibTrendHeight;

  const timeScale = velibTrendDay ? 24 * 60 * 60 : velibTrendTimeScale;
  // $FlowFixMe
  trendGraph.timeScale = timeScale;

  const ctx = trendGraph.getContext('2d');
  if (!ctx) { return rowTrend; }

  const nowMoment = now();
  const { label } = stop;
  const currentStation: Array<ServerVelibResponse> = velibHistory[stop.station];
  const { height, width } = trendGraph;
  let previousX = width;
  let inTime = false;
  for (var dataIndex = currentStation.length - 1; dataIndex >= 0 ; dataIndex--) { //start from most recent
    const { lastUpdate, bike, total } = currentStation[dataIndex];
    let dataTimeStamp = nowMoment.subtract(moment(lastUpdate)).seconds(); // time of the event in seconds ago
    if (dataTimeStamp < timeScale || inTime) {
      inTime = dataTimeStamp < timeScale; // compute the last one outside of the time window
      if (dataTimeStamp - timeScale < 10 * 60) { //takes it only if it is within 10 minutes of the closing windows
        dataTimeStamp = Math.min(dataTimeStamp, timeScale); //to be sure it does not exit the graph
        let x, y;
        if (velibTrendDay) {
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
        y = bike / total * height * 4 / 5;
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
  if (velibTrendDay) {
    ctx.font = Math.round(height / 10) + 'px ' + ctx.font.split(' ').slice(-1)[0];
    // TODO use translation keys
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
    
    // TODO compute properly (use moment)
    // var hourMark = new Date(); var alpha;
    // hourMark.setMinutes(0); hourMark.setSeconds(0);
    // alpha = (hourMark - nowMoment + 24 * 60 * 60 * 1000 - effectiveZoom * 1000) / (24 * 60 * 60 * 1000 - 2 * effectiveZoom * 1000);
    // alpha = (hourMark - nowMoment + effectiveZoom * 1000) / (24 * 60 * 60 * 1000) * width;
    
    // for (var h = 0; h < 24; h = h + 2) {
    //   ctx.fillStyle = 'red';
    //   ctx.textAlign = 'center';
    //   ctx.font = Math.round(height / 12) + 'px';
    //   ctx.fillText(`${(hourMark.getHours() + 24 - h) % 24}`, (2 - h / 24) * width / 3 + alpha, h % 12 * height / 12 / 3 + height / 3);
    // }
  }

  cellTrend.colSpan = CELLS_COUNT; //so that it takes the whole row
  cellTrend.appendChild(trendGraph);
  rowTrend.appendChild(cellTrend);

  return rowTrend;
};

/**
 * @returns HTML for info received for Velib
 */
export const renderVelib = (stop: StationConfiguration, velibHistory: Object, config: ModuleConfiguration): any => {
  const { messages, trendGraphOff } = config;
  const velibStationHistory: Array<ServerVelibResponse> = velibHistory[stop.station];

  if (!velibStationHistory) {
    return renderNoInfoVelib(stop, messages);
  }

  const stationInfo = velibStationHistory.slice(-1)[0];
  if (trendGraphOff) {
    return renderSimpleInfoVelib(stop, stationInfo, messages);
  }

  return renderTrendInfoVelib(stop, stationInfo, velibHistory, config);
};
