/* @flow */

import React from 'react';
import moment from 'moment-timezone';
import ReactDOM from 'react-dom';

import Main from '../components/Main/Main';
import { toHoursMinutesSeconds } from '../support/format';
import { now } from '../support/date';
import { translate, MessageKeys } from '../../support/messages';
import { WRAPPER_ID } from '../../support/configuration';

import type { Data } from '../../types/Application';
import type { ModuleConfiguration, StationConfiguration } from '../../types/Configuration';
import type { ServerVelibResponse } from '../../types/Transport';

/** Table cells configuration */
const CELLS_COUNT = 4;

/**
 * @returns HTML for main wrapper
 */
export const renderWrapper = (): any => {
  const wrapper = document.createElement('div');
  wrapper.id = WRAPPER_ID;
  wrapper.className = 'IDFTransportWrapper';
  
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
 * REACT gateway helper
 */
export const renderMainComponent = (config: ModuleConfiguration, newData?: Object, dataKind?: string): void => {
  ReactDOM.render(
    <Main config={config} newData={newData} dataKind={dataKind} />,
    document.getElementById(WRAPPER_ID)
  );
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
  ctx.font = `${Math.round(height / 5)}px ${ctx.font.split(' ').slice(-1)[0]}`;
  ctx.fillStyle = 'grey';
  ctx.textAlign = 'center';
  ctx.fillText(label || name, width / 2, Math.round(height / 5));
  ctx.textAlign = 'left';
  ctx.fillText(bike.toString(), 10, height - 10);
  ctx.fillText(empty.toString(), 10, Math.round(height / 5) + 10);
  if (velibTrendDay) {
    const text = `${Math.round(velibTrendZoom / 60)}${translate(MessageKeys.UNITS_MINUTES)}`;
    ctx.font = Math.round(height / 10) + 'px ' + ctx.font.split(' ').slice(-1)[0];
    ctx.fillText(text, width * 5 / 6, height / 2);
    ctx.fillText(text, width / 6, height / 2);
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
