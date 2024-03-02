/* @flow */

import { getRefDataFromCache, putRefDataInCache, resetRefDataCache } from './cache';

describe('cache support functions', () => {
  describe('getRefDataFromCache function', () => {
    beforeEach(() => {
      resetRefDataCache();
    });

    it('should return null if no entry found at key', () => {
      // given-when
      const actual = getRefDataFromCache('STOP', '202122', { isStopArea: false });

      // then
      expect(actual).toBeNull();
    });    
    
    it('should return matching entry', () => {
      // given
      putRefDataInCache('STOP', '202122', { isStopArea: false }, 'ref-value');

      // when
      const actual = getRefDataFromCache('STOP', '202122', { isStopArea: false });

      // then
      expect(actual).toBe('ref-value');
    });
  });  
  
  describe('putRefDataInCache function', () => {
    beforeEach(() => {
      resetRefDataCache();
    });

    it('should do nothing if undefined value provided', () => {
      // given-when
      putRefDataInCache('STOP', '202122', { isStopArea: false }, undefined);

      // then
      expect(getRefDataFromCache('STOP', '202122', { isStopArea: false })).toBeNull();
    });    
    
    it('should put stop-area value in cache', () => {
      // given-when
      putRefDataInCache('STOP', '202122', { isStopArea: true }, 'ref-value');

      // then
      expect(getRefDataFromCache('STOP', '202122', { isStopArea: false })).toBeNull();
      expect(getRefDataFromCache('STOP', '202122', { isStopArea: true })).toBe('ref-value');
    });    
  });  
  
  describe('resetRefDataCache function', () => {
    it('should remove all entries', () => {
      // given
      putRefDataInCache('STOP', '202122', { isStopArea: false }, undefined);
      putRefDataInCache('STOP', '202122', { isStopArea: true }, undefined);

      // when
      resetRefDataCache();

      // then
      expect(getRefDataFromCache('STOP', '202122', { isStopArea: false })).toBeNull();
      expect(getRefDataFromCache('STOP', '202122', { isStopArea: true })).toBeNull();
    });    
  });
});