/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';

import type { ModuleConfiguration } from '../../types/Configuration';

import Main from '../components/Main/Main';
import { WRAPPER_ID } from '../../support/configuration';

// TODO add css loader to webpack
// import '../../../css/module.css';

/** REACT init helper */
const ModuleBootstrap = (config: ModuleConfiguration) => {
  ReactDOM.render(
    <Main config={config} />,
    document.getElementById(WRAPPER_ID)
  );
};

export default ModuleBootstrap;
