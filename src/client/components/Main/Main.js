/* @flow */

import React, { PureComponent } from 'react';

import type { ModuleConfiguration } from '../../../types/Configuration';

type PropTypes = {
  config: ModuleConfiguration,
};

type StateType = {

};

/**
 * Main component for local transport information
 */
class Main extends PureComponent<PropTypes, StateType> {
  constructor(props: PropTypes) {
    super(props);
  }

  render() {
    return (
      <div>Main</div>
    );
  }
}

export default Main;