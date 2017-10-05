/* @flow */

import React, { PureComponent } from 'react';
import classnames from 'classnames';

import Traffic from '../Traffic/Traffic';
import Schedules from '../Schedules/Schedules';
import Velib from '../Velib/Velib';
import { translate, MessageKeys } from '../../../support/messages';
import * as DataKind from '../../support/dataKind';
import { fetchStopConfiguration } from '../../../support/configuration';

import type { ModuleConfiguration } from '../../../types/Configuration';

import '../../../styles/reset.scss';
import '../../../styles/module.scss';
import './Main.scss';

type PropTypes = {
  config: ModuleConfiguration,
  newData: ?Object,
  dataKind: ?string,
};

type StateType = {
  trafficEntries: Object,
  schedulesEntries: Object,
  velibHistory: Object,
  lastUpdate: Object,
  isReady: boolean,
};

/**
 * Main component for local Schedules information
 */
class Main extends PureComponent<PropTypes, StateType> {
  static defaultProps = {}

  constructor(props: PropTypes) {
    super(props);

    this.state = {
      trafficEntries: {},
      schedulesEntries: {},
      velibHistory: {},
      lastUpdate: {},
      isReady: false,
    };
  }

  componentWillReceiveProps(nextProps: PropTypes): void {
    const { dataKind, newData} = nextProps;
    if(!newData) return;

    const { trafficEntries, schedulesEntries, velibHistory } = this.state;
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
      case DataKind.DATA_TRAFFIC:
        this.setState({
          trafficEntries: {
            ...trafficEntries,
            ...newEntry,
          },
          isReady: true,
        });
        break;
      case DataKind.DATA_TRANSPORT:
        this.setState({
          schedulesEntries: {
            ...schedulesEntries,
            ...newEntry,
          },
          isReady: true,
        });
        break;
      case DataKind.DATA_VELIB:
        this.setState({
          velibHistory: {
            ...velibHistory,
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
    const { isReady, trafficEntries, schedulesEntries, velibHistory, lastUpdate } = this.state;
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
        { !!Object.keys(velibHistory).length &&
          <Velib entries={velibHistory} config={config} />
        }
      </div>
    );
  }
}

export default Main;
