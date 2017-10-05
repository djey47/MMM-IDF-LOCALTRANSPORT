/* @flow */

import React from 'react';
import classnames from 'classnames';

import { translate, MessageKeys } from '../../../support/messages';
import { TrafficStatus, TrafficMessageKeys } from '../../../support/status';

import type { ServerTrafficResponse } from '../../../types/Transport';

import './TrafficItem.scss';

type PropTypes = {
  data: ServerTrafficResponse,
  label: ?string,
  messages: Object,
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
const resolveLine = (line: ?Array<string|number>|?string): ?string => {
  if (line && typeof(line) === 'object') {
    return line.length === 2 ? line[1].toString() : null;
  } else if (line) {
    return line.toString();
  }
  return null;
};

/**
 * A traffic info item
 */
const TrafficItem = ({ data, label, messages }: PropTypes) => {
  const { status, summary, message, line } = data;
  const unavailableLabel = translate(MessageKeys.UNAVAILABLE, messages);
  const itemClassName = classnames('TrafficItem', 'bright', {
    'is-ok': status === TrafficStatus.OK,
    'is-ok-with-work': status === TrafficStatus.OK_WORK,
    'is-ko': status === TrafficStatus.KO,
  });

  return (
    <li className={itemClassName}>
      <span className="TrafficItem__label">{label || resolveLine(line) || unavailableLabel}</span>
      <span className="TrafficItem__status">{resolveStatus(status, messages, TrafficMessageKeys)}</span>
      <span className="TrafficItem__infos">
        <span className="TrafficItem__title">{summary || unavailableLabel}</span>
        <div className="TrafficItem__messageContainer">
          <div className="TrafficItem__messageContents">{message || ''}</div>
        </div>
      </span>
    </li>
  );
};

export default TrafficItem;
