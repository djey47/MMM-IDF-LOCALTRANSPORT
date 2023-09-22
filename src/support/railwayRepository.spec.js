/* @flow-disabled */

import { resetRefDataCache } from './cache';
// import { defaults } from './configuration';

const mockThen = jest.fn();
const mockAll = jest.fn(() => ({
  then: () => mockThen(),
}));
const mockGet = jest.fn();
jest.mock('axios', () => ({
  get: (url, axiosConfig) => mockGet(url, axiosConfig),
  all: () => mockAll(),
}));

const mockResolve = jest.fn();

// const config = {
//   ...defaults,
// };

beforeEach(() => {
  mockGet.mockReset();
  mockAll.mockReset();
  mockResolve.mockReset();
  resetRefDataCache();
});

// describe('getStationInfo function', () => {
//   it('should return Promise', () => {
//     // given
//     const query = {
//       index: 0,
//       stationValue: 'Lazare',
//       destinationValue: 'St Cloud',
//     };
//     // when
//     const actual = getStationInfo(query, config);
//     // then
//     expect(actual).toBeDefined();
//     expect(mockAll).toHaveBeenCalled();
//     expect(mockGet).toHaveBeenCalledTimes(2);
//     expect(mockGet).toHaveBeenCalledWith('https://foo/barsearch?q=St%20Cloud&dataset=sncf-gares-et-arrets-transilien-ile-de-france&sort=libelle', axiosConfig);
//     expect(mockGet).toHaveBeenCalledWith('https://foo/barsearch?q=Lazare&dataset=sncf-gares-et-arrets-transilien-ile-de-france&sort=libelle', axiosConfig);
//   });

//   it('should return Promise without API call if response already in cache', () => {
//     // given
//     const query = {
//       index: 0,
//       stationValue: 'Lazare',
//     };
//     putInfoInCache('Lazare', { code_uic: 'UIC1', libelle: 'L1' });
//     // when
//     const actual = getStationInfo(query, config);
//     // then
//     expect(actual).toBeDefined();
//     expect(mockAll).not.toHaveBeenCalled();
//     expect(mockGet).not.toHaveBeenCalled();
//   });
// });

// describe('getAllStationInfo function', () => {
//   it('should return Promise', () => {
//     // given
//     const queries = [{
//       index: 0,
//       stationValue: 'Lazare',
//       destinationValue: 'St Cloud',
//     }, {
//       index: 1,
//       stationValue: 'Chaville',
//       destinationValue: 'Versailles',
//     }];
//     // when
//     const actual = getAllStationInfo(queries, config);
//     // then
//     expect(actual).toBeDefined();
//     expect(mockGet).toHaveBeenCalledTimes(4);
//   });
// });
