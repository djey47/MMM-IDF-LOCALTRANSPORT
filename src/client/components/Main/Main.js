/* @flow */

import React, { PureComponent } from 'react';
import classnames from 'classnames';

import Traffic from '../Traffic/Traffic';
import Schedules from '../Schedules/Schedules';
import { translate, MessageKeys } from '../../../support/messages';
import { DATA_TRAFFIC, DATA_TRANSPORT } from '../../support/dataKind';
import { fetchStopConfiguration } from '../../../support/configuration';

import type { ModuleConfiguration } from '../../../types/Configuration';

type PropTypes = {
  config: ModuleConfiguration,
  newData: ?Object,
  dataKind: ?string,
};

type StateType = {
  trafficEntries: Object,
  schedulesEntries: Object,
  lastUpdate: Object,
  isReady: boolean,
};

/**
 * Main component for local Schedules information
 */
class Main extends PureComponent {
  props: PropTypes;
  state: StateType;

  static defaultProps = {}

  constructor(props: PropTypes) {
    super(props);

    this.state = {
      trafficEntries: {},
      schedulesEntries: {},
      lastUpdate: {},
      isReady: false,
    };
  }

  componentWillReceiveProps(nextProps: PropTypes): void {
    const { dataKind, newData} = nextProps;
    if(!newData) return;

    const { trafficEntries, schedulesEntries } = this.state;
    const { id } = newData; 
    const stopConfig = fetchStopConfiguration(this.props.config, id);
    
    this.setState({
      lastUpdate: {
        ...this.state.lastUpdate,
        [id]: newData.lastUpdate,
      },
    });
    
    const newEntry = {
      [id]: {
        data: newData,
        stop: stopConfig,
      },
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
      case DATA_TRANSPORT:
        this.setState({
          schedulesEntries: {
            ...schedulesEntries,
            ...newEntry,
          },
          isReady: true,
        });
        break;
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
    const { config, config: { messages } } = this.props;
    const { isReady, trafficEntries, schedulesEntries, lastUpdate } = this.state;
    return (
      <div className={classnames('Main', 'dimmed', 'light', 'small')}>
        { !isReady &&
          <p>{translate(MessageKeys.LOADING, messages)}</p>
        }
        { !!Object.keys(trafficEntries).length &&
          <Traffic entries={trafficEntries} messages={messages} />
        }
        { !!Object.keys(schedulesEntries).length &&
          <Schedules entries={schedulesEntries} config={config} lastUpdateInfo={lastUpdate} />
        }
      </div>
    );
  }
}

export default Main;
