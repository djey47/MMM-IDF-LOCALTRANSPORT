/* @flow */

import React, { PureComponent } from 'react';

import SchedulesItem from './SchedulesItem';

import type { ModuleConfiguration } from '../../../types/Configuration';

type PropsType = {
  entries: Object,
  config: ModuleConfiguration,
};

type StateType = {};

/**
 * List of schedule items (next arrivals)
 */
class Schedules extends PureComponent {
  props: PropsType;
  state: StateType;

  static defaultProps = {
    entries: {},
  }

  render() {
    // TODO concatenateArrivals: 1 item per arrival
    const { entries, config } = this.props;
    return (
      <ul className="Schedules">
        {Object.keys(entries).map(index => {
          const { data, stop } = entries[index];
          return <SchedulesItem key={index} data={data} stop={stop} config={config} />;
        })}
      </ul>
    );
  }
}

export default Schedules;
