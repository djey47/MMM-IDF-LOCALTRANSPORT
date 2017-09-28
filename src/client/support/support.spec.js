import reduceByDestination from './schedules';

describe('reduceByDestination function', () => {
  it('should group schedules with same destination', () => {
    // given
    const entries = {
      'gare/87382333//depart': {
        stop: {},
        data: {
          id: 'gare/87382333//depart',
          schedules: [{
            code: 'DEFI',
            destination: 'La defense',
            time: '2017-10-02T16:01:00.000Z',
          },{
            code: 'DEFI',
            destination: 'La defense',
            time: '2017-10-02T16:10:00.000Z',            
          },{
            code: 'VERI',
            destination: 'La verriere',
            time: '2017-10-02T16:15:00.000Z',
          },{
            code: 'VERI',
            destination: 'La verriere',
            time: '2017-10-02T16:25:00.000Z',
          }],
        },
      },
      'gare/87382335//depart': {
        stop: {},
        data: {
          id: 'gare/87382335//depart',
          schedules: [{
            code: 'DEFI',
            destination: 'La defense',
            time: '2017-10-02T16:03:00.000Z',
          },{
            code: 'DEFI',
            destination: 'La defense',
            time: '2017-10-02T16:12:00.000Z',            
          },{
            code: 'VERI',
            destination: 'La verriere',
            time: '2017-10-02T16:17:00.000Z',
          },{
            code: 'VERI',
            destination: 'La verriere',
            time: '2017-10-02T16:27:00.000Z',
          }],
        },
      },
    };

    // when
    const actual = reduceByDestination(entries);

    // then
    const expected = {
      'gare/87382333//depart': {
        stop: {},
        data: {
          schedules: [{
            code: 'DEFI',
            destination: 'La defense',
            time: '2017-10-02T16:01:00.000Z',
            times: ['2017-10-02T16:01:00.000Z', '2017-10-02T16:10:00.000Z'],
          }, {
            code: 'VERI',
            destination: 'La verriere',
            time: '2017-10-02T16:15:00.000Z',
            times: ['2017-10-02T16:15:00.000Z', '2017-10-02T16:25:00.000Z'],          
          }],
        },
      },
      'gare/87382335//depart': {
        stop: {},
        data: {
          schedules: [{
            code: 'DEFI',
            destination: 'La defense',
            time: '2017-10-02T16:03:00.000Z',
            times: ['2017-10-02T16:03:00.000Z', '2017-10-02T16:12:00.000Z'],
          }, {
            code: 'VERI',
            destination: 'La verriere',
            time: '2017-10-02T16:17:00.000Z',
            times: ['2017-10-02T16:17:00.000Z', '2017-10-02T16:27:00.000Z'],          
          }],
        },
      },
    };
    expect(actual).toEqual(expected);
  });
});
