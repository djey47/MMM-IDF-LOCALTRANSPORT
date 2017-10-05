/* @flow */

import React from 'react';
import classnames from 'classnames';
import kebabCase from 'lodash/kebabCase';

import { translate, MessageKeys } from '../../../support/messages';
import { Status, MessageKeys as StatusMessageKeys, TimeModes } from '../../../support/status';
import { toWaitingTime, toHoursMinutes } from '../../support/format';
import { now } from '../../support/date';

import type Moment from 'moment';
import type { ServerScheduleResponse, Schedule } from '../../../types/Transport';
import type { ModuleConfiguration, StationConfiguration } from '../../../types/Configuration';

import './SchedulesItem.scss';

type PropTypes = {
  data: ServerScheduleResponse,
  stop: StationConfiguration,
  config: ModuleConfiguration,
  lastUpdate?: Moment,
};

/**
 * @private
 */
const resolveName = (stop: StationConfiguration, messages: Object): string => {
  const { line, label, station } = stop;

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
 * @private
 */
const resolveSingleTime = (time?: ?string, config: ModuleConfiguration,  nowMoment: Moment): string => {
  const { convertToWaitingTime, messages } = config;

  if (!time) return translate(MessageKeys.UNAVAILABLE, messages);
  
  if (convertToWaitingTime) return toWaitingTime(time, nowMoment, messages);

  return toHoursMinutes(time);
};

/**
 * @private
 */
const resolveDepartures = (schedule: Schedule, config: ModuleConfiguration, nowMoment: Moment): string => {
  const { time, times } = schedule;

  if (config.concatenateArrivals && times) {
    return times.map(t => resolveSingleTime(t, config, nowMoment)).join(' / ');
  } 
  
  return resolveSingleTime(time, config, nowMoment);
};

/**
 * @private
 */
const computeOpacity = (nowMoment: Moment, lastUpdateMoment?: Moment, config: ModuleConfiguration): string => {
  // TODO unit test
  let opacity = '1';

  const { oldUpdateThreshold, updateInterval, oldThreshold, oldUpdateOpacity } = config;
  const effectiveThreshold = oldUpdateThreshold ? oldUpdateThreshold : updateInterval * (1 + oldThreshold);  
  if (lastUpdateMoment && nowMoment.diff(lastUpdateMoment).valueOf() > effectiveThreshold) {
    opacity = oldUpdateOpacity.toString();
  }
  
  return opacity;
};
  
/**
 * A traffic info item
 */
const SchedulesItem = ({ data, stop, config, lastUpdate }: PropTypes) => {
  const { schedules } = data;
  const {
    messages,
    maxLettersForDestination,
    maxLettersForTime,
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
          const depInfo = resolveDepartures(schedule, config, nowMoment);
          const theoricalSuffix = timeMode === TimeModes.THEORICAL ? translate(MessageKeys.THEORICAL, messages) : '';
          const opacity = computeOpacity(nowMoment, lastUpdate, config);

          return (
            <li className={itemClassName} key={`${kebabCase(destination)}-${time || '0'}`}>
              <span className="SchedulesItem__name">
                {resolveName(stop, messages)}
              </span>
              <span className="SchedulesItem__destination" style={{ opacity }}>
                {destination.substr(0, maxLettersForDestination)}
              </span>
              <span className="SchedulesItem__status">
                {`${code || ''} ${resolveStatus(status, messages, StatusMessageKeys)}`.trim()}
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
