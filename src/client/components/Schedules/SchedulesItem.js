/* @flow */

import React from 'react';
import classnames from 'classnames';

import { translate, MessageKeys } from '../../../support/messages';
import { Status, MessageKeys as StatusMessageKeys, TimeModes } from '../../../support/status';
import { toWaitingTime, toHoursMinutes } from '../../support/format';
import { now } from '../../support/date';

import type { ServerScheduleResponse } from '../../../types/Transport';
import type { ModuleConfiguration, StationConfiguration } from '../../../types/Configuration';

// TODO style
// import './Traffic.css';

type PropTypes = {
  data: ServerScheduleResponse,
  stop: StationConfiguration,
  config: ModuleConfiguration,
};

/**
 * @private
 */
const resolveName = (/*firstLine: boolean, */stop: StationConfiguration, messages: Object): string => {
  const { line, label, station } = stop;

  // if (!firstLine) return ' ';

  if (label) return label;

  if (line) return line.toString();

  if (station) return station.toString();

  return translate(MessageKeys.UNAVAILABLE, messages);
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
 * A traffic info item
 */
const SchedulesItem = ({ data, stop, config }: PropTypes) => {
  // TODO: comingLastUpdate
  const { schedules } = data;
  const {
    messages,
    maxLettersForDestination,
    maxLettersForTime,
    convertToWaitingTime,
    oldUpdateThreshold,
    oldUpdateOpacity,
    oldThreshold,
    updateInterval, 
  } = config;
  const nowMoment = now();  

  return (
    <li className="SchedulesItem">
      <ul className="SchedulesItem__schedules">
        { schedules.map(schedule => {
          const { status, destination, code, time, timeMode } = schedule;
          const itemClassName = classnames('SchedulesItem__schedule', 'bright', {
            'is-delayed': status === Status.DELAYED,
            'is-deleted': status === Status.DELETED,
            'is-ontime': status === Status.ON_TIME,
          });
          let depInfo;
          if (!time) {
            depInfo = translate(MessageKeys.UNAVAILABLE, messages);
          } else if (convertToWaitingTime) {
            depInfo = toWaitingTime(time, nowMoment, messages);
          } else {
            depInfo = toHoursMinutes(time);
          }
          // TODO set into state
          const comingLastUpdate = now();
          const theoricalSuffix = timeMode === TimeModes.THEORICAL ? translate(MessageKeys.THEORICAL, messages) : '';
          const effectiveThreshold = oldUpdateThreshold ? oldUpdateThreshold : updateInterval * (1 + oldThreshold);
          let opacity = '1';
          if (nowMoment.diff(comingLastUpdate).valueOf() > effectiveThreshold) {
            opacity = oldUpdateOpacity.toString();
          }
          const effectiveCode = code || '';

          return (
            <li className={itemClassName} key={`${effectiveCode}-${time || '0'}`}>
              <span className="SchedulesItem__name">
                {resolveName(stop, messages)}
              </span>
              <span className="SchedulesItem__destination" style={{ opacity }}>
                {destination.substr(0, maxLettersForDestination)}
              </span>
              <span className="SchedulesItem__status">
                {`${effectiveCode} ${resolveStatus(status, messages, StatusMessageKeys)}`.trim()}
              </span>
              <span className="SchedulesItem__departure" style={{ opacity }}>
                {depInfo.concat(theoricalSuffix).substr(0, maxLettersForTime)}
              </span>
            </li>
          );
        })
        }
      </ul>
    </li>
  );
};

export default SchedulesItem;
