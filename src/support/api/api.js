/* @flow */

import CitymapperApi from './citymapper';
import LegacyApi from './legacy';
import { TYPE_TRAFFIC_LEGACY, TYPE_TRAFFIC_TRANSILIEN } from '../../support/configuration';

import type { StationConfiguration } from '../../types/Configuration';

/**
 * @returns correct stop index with provided configuration
 */
export const resolveIndexFromStopConfig = (station: StationConfiguration): ?string => {
  const { type } = station;

  switch (type) {
    case TYPE_TRAFFIC_LEGACY:
      return LegacyApi.createTrafficIndexFromStopConfig(station);
    case TYPE_TRAFFIC_TRANSILIEN:
      return CitymapperApi.createTrafficIndexFromStopConfig(station);
    default:
      return null;
  }
};
