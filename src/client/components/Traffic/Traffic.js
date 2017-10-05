/* @flow */

import React, { PureComponent } from 'react';

import TrafficItem from './TrafficItem';

import './Traffic.scss';

type PropsType = {
  entries: Object,
  messages: Object,
};

type StateType = {};

/**
 * List of traffic information items
 */
class Traffic extends PureComponent<PropsType, StateType> {
  static defaultProps = {
    entries: {},
  }

  render() {
    const { entries, messages } = this.props;
    return (
      <ul className="Traffic">
        {Object.keys(entries).map(index => {
          const { data, stop: { label } } = entries[index];
          return <TrafficItem key={index} data={data} label={label} messages={messages} />;
        })}
      </ul>
    );
  }
}

export default Traffic;
