/* @flow */

import React, { PureComponent } from 'react';
import classnames from 'classnames';

import Traffic from '../Traffic/Traffic';
import { translate, MessageKeys } from '../../../support/messages';
import CitymapperApi from '../../../support/api/citymapper';
import LegacyApi from '../../../support/api/legacy';
import { DATA_TRAFFIC } from '../../support/dataKind';
import { TYPE_TRAFFIC_LEGACY, TYPE_TRAFFIC_TRANSILIEN } from '../../../support/configuration';

import type { ModuleConfiguration, StationConfiguration } from '../../../types/Configuration';

type PropTypes = {
  config: ModuleConfiguration,
  newData: ?Object,
  dataKind: ?string,
};

type StateType = {
  trafficEntries: Object,
  isReady: boolean,
};

/**
 * Main component for local transport information
 */
class Main extends PureComponent {
  props: PropTypes;
  state: StateType;

  static defaultProps = {}

  constructor(props: PropTypes) {
    super(props);

    this.state = {
      trafficEntries: {},
      isReady: false,
    };
  }

  resolveIndex = (station: StationConfiguration): ?string => {
    const { type } = station;

    switch (type) {
      case TYPE_TRAFFIC_LEGACY:
        return LegacyApi.createTrafficIndexFromStopConfig(station);
      case TYPE_TRAFFIC_TRANSILIEN:
        return CitymapperApi.createTrafficIndexFromStopConfig(station);
      default:
        return null;
    }
  }

  fetchStopConfiguration = (id: string): StationConfiguration => {
    const { config: { stations } } = this.props;
    const result = stations.filter(station => this.resolveIndex(station) === id);
    return result[0];
  }

  componentWillReceiveProps(nextProps: PropTypes): void {
    const { dataKind, newData} = nextProps;
    if(!newData) return;

    const { trafficEntries } = this.state;
    const { id } = newData; 
    const stopConfig = this.fetchStopConfiguration(id);
    const newEntry = {};
    newEntry[id] = {
      data: newData,
      stop: stopConfig,
    };

    switch (dataKind) {
      case DATA_TRAFFIC:
        this.setState({
          trafficEntries: {
            ...trafficEntries,
            ...newEntry,
          },
          isReady: true,
        });
        break;
      default:
    }
  }

  shouldComponentUpdate(nextProps: PropTypes, nextState: StateType): boolean {
    console.log('shouldComponentUpdate');
    console.log(nextProps);
    console.log(nextState);

    // TODO compute
    return true;
  }

  render() {
    const { config: { messages } } = this.props;
    const { isReady, trafficEntries } = this.state;
    return (
      <div className={classnames('Main', 'dimmed', 'light', 'small')}>
        { !isReady &&
          <p>{translate(MessageKeys.LOADING, messages)}</p>
        }
        { !!Object.keys(trafficEntries).length &&
          <Traffic entries={trafficEntries} messages={messages} />
        }
      </div>
    );
  }
}

export default Main;
