/* @flow */

import { formatDateFull } from '../support/format';

type Stop = {
  line: string[],
  label: string,
};

/**
 * @returns module header contents
 */
export const renderHeader = (config: Object): string => {
  const { updateInterval, showLastUpdateTime, lastUpdate, showSecondsToNextUpdate } = config;

  let contents = '';
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
  const stopIndex = `traffic/${stop.line[0].toLowerCase()}/${stop.line[1].toLowerCase()}`;
  const row = document.createElement('tr');

  const firstCell = document.createElement('td');
  firstCell.className = 'align-right bright';
  firstCell.innerHTML = stop.label || stop.line[1];
  row.appendChild(firstCell);

  const { message } = ratpTraffic[stopIndex] ? ratpTraffic[stopIndex] : { message: 'N/A' };
  const secondCell = document.createElement('td');
  secondCell.className = 'align-left';
  secondCell.innerHTML = config.conversion[message] || message;
  secondCell.colSpan = 2;
  row.appendChild(secondCell);

  return row;
};
