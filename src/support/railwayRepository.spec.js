/* @flow */

import {
  getStationInfo,
  getAllStationInfo,
  handleInfoResponsesOnSuccess,
  axiosConfig,
} from './railwayRepository';
import {
  putInfoInCache,
  resetInfoCache,
  getInfoFromCache,
} from './cache';
import { defaults } from './configuration';

jest.mock('axios');
const mockAxios = require('axios');

const mockResolve = jest.fn();

const config = {
  ...defaults,
  apiSncfData: 'https://foo/bar',
};

describe('railway repository functions', () => {
  beforeEach(() => {
    mockAxios.get.mockReset();
    mockAxios.all.mockReset();
    mockResolve.mockReset();

    mockAxios.get.mockImplementation((url, axiosConfig) => ({
      url,
      axiosConfig,
      then: () => {},
    }));
    mockAxios.all.mockImplementation((axiosPromises) => ({
      axiosPromises,
      then: () => {},
    }));

    resetInfoCache();
  });

  describe('getStationInfo function', () => {
    it('should return Promise', () => {
      // given
      const query = {
        index: 0,
        stationValue: 'Lazare',
        destinationValue: 'St Cloud',
      };
      // when
      const actual = getStationInfo(query, config);
      // then
      expect(actual).toBeDefined();
      expect(mockAxios.all).toHaveBeenCalled();
      expect(mockAxios.get).toHaveBeenCalledTimes(2);
      expect(mockAxios.get).toHaveBeenCalledWith('https://foo/barsearch?q=St%20Cloud&dataset=sncf-gares-et-arrets-transilien-ile-de-france&sort=libelle', axiosConfig);
      expect(mockAxios.get).toHaveBeenCalledWith('https://foo/barsearch?q=Lazare&dataset=sncf-gares-et-arrets-transilien-ile-de-france&sort=libelle', axiosConfig);
    });

    it('should return Promise without API call if response already in cache', () => {
      // given
      const query = {
        index: 0,
        stationValue: 'Lazare',
      };
      putInfoInCache('Lazare', { code_uic: 'UIC1', libelle: 'L1' });
      // when
      const actual = getStationInfo(query, config);
      // then
      expect(actual).toBeDefined();
      expect(mockAxios.all).not.toHaveBeenCalled();
      expect(mockAxios.get).not.toHaveBeenCalled();
    });
  });

  describe('getAllStationInfo function', () => {
    it('should return Promise', () => {
      // given
      const queries = [{
        index: 0,
        stationValue: 'Lazare',
        destinationValue: 'St Cloud',
      }, {
        index: 1,
        stationValue: 'Chaville',
        destinationValue: 'Versailles',
      }];
      // when
      const actual = getAllStationInfo(queries, config);
      // then
      expect(actual).toBeDefined();
      expect(mockAxios.get).toHaveBeenCalledTimes(4);
      expect(mockAxios.all).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleInfoResponsesOnSuccess function', () => {
    it('should resolve values properly for both station and destination, and update cache', () => {
      // given
      const responses = [
        {
          data: {
            records: [
              {
                fields: { libelle: 'becon', code_uic: 'UIC1' },
              },
            ],
          },
        },
        {
          data: {
            records: [
              {
                fields: { libelle: 'st cloud', code_uic: 'UIC2' },
              },
            ],
          },
        },
      ];
      const query = {
        index: 0,
        stationValue: 'Becon',
        destinationValue: 'St Cloud',
      };
      // when
      handleInfoResponsesOnSuccess(responses, mockResolve, query, config.debug);
      // then
      expect(mockResolve).toHaveBeenCalledWith({
        index: 0,
        stationInfo: {
          libelle: 'becon',
          code_uic: 'UIC1',
        },
        destinationInfo: {
          libelle: 'st cloud',
          code_uic: 'UIC2',
        },
      });
      expect(getInfoFromCache('Becon')).toEqual({ libelle: 'becon', code_uic: 'UIC1' });
      expect(getInfoFromCache('St Cloud')).toEqual({ libelle: 'st cloud', code_uic: 'UIC2' });
    });

    it('should resolve values properly for station only, and update cache', () => {
      // given
      const responses = [
        {
          data: {
            records: [
              {
                fields: { libelle: 'becon', code_uic: 'UIC1' },
              },
            ],
          },
        },
      ];
      const query = {
        index: 0,
        stationValue: 'Becon',
      };
      // when
      handleInfoResponsesOnSuccess(responses, mockResolve, query, config.debug);
      // then
      expect(mockResolve).toHaveBeenCalledWith({
        index: 0,
        stationInfo: {
          libelle: 'becon',
          code_uic: 'UIC1',
        },
        destinationInfo: null,
      });
      expect(getInfoFromCache('Becon')).toEqual({ libelle: 'becon', code_uic: 'UIC1' });
    });

    it('should resolve to null when wrong response', () => {
      // given
      const responses = [
        {
          data: { records: []},
        },
      ];
      const query = {
        index: 0,
        stationValue: 'Becon',
      };
      // when
      handleInfoResponsesOnSuccess(responses, mockResolve, query, config.debug);
      // then
      expect(mockResolve).toHaveBeenCalledWith(null);

    });
  });
});
