/* @flow */

import React, { PureComponent } from 'react';
import classnames from 'classnames';

import Traffic from '../Traffic/Traffic';
import { translate, MessageKeys } from '../../../support/messages';
import { DATA_TRAFFIC } from '../../support/dataKind';
import { fetchStopConfiguration } from '../../../support/configuration';

import type { ModuleConfiguration } from '../../../types/Configuration';

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

  componentWillReceiveProps(nextProps: PropTypes): void {
    const { dataKind, newData} = nextProps;
    if(!newData) return;

    const { trafficEntries } = this.state;
    const { id } = newData; 
    const stopConfig = fetchStopConfiguration(this.props.config, id);
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
