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
   * @private
   */
  sortEntriesByOrder = (entries: Object) => {
    return Object.keys(entries)
      .map(index => ({
        ...entries[index],
        index,
      }))
      .sort((entry1, entry2) => entry1.stop.order - entry2.stop.order);
  }

  /**
   * @returns Markup
   */
  render() {
    const { config, lastUpdateInfo } = this.props;
    const processedEntries = this.processEntries();
    const sortedEntries = this.sortEntriesByOrder(processedEntries);
    return (
      <ul className="Schedules">
        {sortedEntries.map(entry => {
          const { data, stop, index } = entry;
          return <SchedulesItem key={index} data={data} stop={stop} config={config} lastUpdate={lastUpdateInfo[index]} />;
        })}
      </ul>
    );
  }
}

export default Schedules;
