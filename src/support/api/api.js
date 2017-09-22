/* @flow */

import CitymapperApi from './citymapper';
import LegacyApi from './legacy';
import TransilienApi from './transilien';
import {
  TYPE_TRAFFIC_LEGACY,
  TYPE_TRAFFIC_TRANSILIEN,
  TYPE_BUS,
  TYPE_METRO,
  TYPE_RER,
  TYPE_TRANSILIEN,
  TYPE_TRAMWAY,
} from '../../support/configuration';

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
    case TYPE_TRANSILIEN:
      return TransilienApi.createIndexFromStopConfig(station);
    case TYPE_BUS:
    case TYPE_METRO:
    case TYPE_RER:
    case TYPE_TRAMWAY:
      return LegacyApi.createIndexFromStopConfig(station);
    default:
      return null;
  }
};
