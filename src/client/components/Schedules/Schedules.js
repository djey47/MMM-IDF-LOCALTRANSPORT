/* @flow */

import React, { PureComponent } from 'react';

import SchedulesItem from './SchedulesItem';
import reduceByDestination from '../../support/schedules';

import type { ModuleConfiguration } from '../../../types/Configuration';

import './Schedules.scss';

type PropsType = {
  entries: Object,
  config: ModuleConfiguration,
  lastUpdateInfo: Object,
};

/**
 * List of schedule items (next arrivals)
 */
class Schedules extends PureComponent<PropsType> {
  static defaultProps = {
    entries: {},
  }

  /**
   * @private
   */
  processEntries = () => {
    const { entries, config: { concatenateArrivals } } = this.props;

    if (!concatenateArrivals) return entries;

    return reduceByDestination(entries);
  }

  /**
   * @returns Markup
   */
  render() {
    const { config, lastUpdateInfo } = this.props;
    const processedEntries = this.processEntries();
    return (
      <ul className="Schedules">
        {Object.keys(processedEntries).map(index => {
          const { data, stop } = processedEntries[index];
          return <SchedulesItem key={index} data={data} stop={stop} config={config} lastUpdate={lastUpdateInfo[index]} />;
        })}
      </ul>
    );
  }
}

export default Schedules;
