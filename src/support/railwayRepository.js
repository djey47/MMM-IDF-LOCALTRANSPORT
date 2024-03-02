/* @flow */

import { normalizeText } from 'normalize-text';
import {
  getRefDataFromCache,
  putRefDataInCache,
} from './cache';
import linesRefData from './api/static/lines-ref.json';
import stopRefData from './api/static/stops-ref.json';

import type {
  DecodedRef,
  RefDataQuery,
  RefDataResponse,
} from '../types/Transport';

export const axiosConfig = {
  headers: {
    Accept: 'application/json;charset=utf-8',
  },
};

/**
 * Relies upon a static configuration from now on (synchronous request)
 */
export const resolveRefData = (query: RefDataQuery): RefDataResponse => {
  const { lineValue, stationValue, destinationValue }  = query;

  // Stop
  const stopAreaRef = resolveStopRef(stationValue, true);

  // Destination
  const destinationRef = destinationValue ? resolveStopRef(destinationValue, false) : undefined;

  // Line
  const lineRef = resolveLineRef(lineValue);

  return {
    lineRef,
    stopAreaRef,
    destinationRef,
  };
};

/**
 * Converts encoded ref values from the STIF repository: <OWNER>:<TYPE>:[<SUBTYPE>]:REF
 * e.g STIF:StopArea:SP:42587: 
 * @returns the decoded items
 */
export const decodeRefValue = (fullCode: string): DecodedRef => {
  const [owner, type, subType, ref] = fullCode.split(':');
  return {
    owner,
    type,
    subType,
    ref,
  };
};

const resolveStopRef = (name: string, isStopArea: boolean) => {
  const cachedValue = getRefDataFromCache('STOP', name, { isStopArea });
  if (cachedValue) {
    return cachedValue;
  }

  const match = stopRefData.find((srd) => normalizeText(srd.arrname) === normalizeText(name));
  if (match) {
    const resolved = isStopArea ? match.zdaid : match.arrid;
    putRefDataInCache('STOP', name, { isStopArea }, resolved);
    return resolved;
  }

  console.error(' *** Unable to resolve reference data for transilien stop', { name, isStopArea });

  return undefined;
};

const resolveLineRef = (name: string) => {
  // Query cache
  const cachedValue = getRefDataFromCache('LINE', name);
  if (cachedValue) {
    return cachedValue;
  }

  const match = linesRefData.find((lrd) => normalizeText(lrd.name_line) === normalizeText(name));
  if (match) {
    const resolved = match.id_line;
    putRefDataInCache('LINE', name, undefined, resolved);
    return resolved;
  }

  console.error('Unable to resolve reference data for transilien line', name);

  return undefined;
};
