/* @flow */

import React, { PureComponent } from 'react';

import TrafficItem from './TrafficItem';

import type { ServerTrafficResponse } from '../../../types/Transport';
import type { StationConfiguration } from '../../../types/Configuration';

type TrafficEntry = {
  data: ServerTrafficResponse,
  stop: StationConfiguration,
};

type PropsType = {
  entries: Object,
  messages: Object,
};

type StateType = {};

/**
 * List of traffic information items
 * 
 * @class Traffic
 * @extends {PureComponent<PropsType, StateType>}
 */
class Traffic extends PureComponent {
  props: PropsType;
  state: StateType;

  static defaultProps = {
    entries: {},
  }

  render() {
    const { entries, messages } = this.props;
    return (
      <ul className="Traffic">
        {Object.keys(entries).map(index => {
          const { data, stop: { label } }: TrafficEntry = entries[index];
          return <TrafficItem key={index} data={data} label={label} messages={messages} />;
        })}
      </ul>
    );
  }
}

export default Traffic;
