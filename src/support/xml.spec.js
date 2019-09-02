/* @flow */

import { xmlToJson, isXml } from './xml';

describe('xmlToJson function', () => {
  it('should return null when unparsable data', () => {
    // given
    const xml = '<guestbook';
    // when
    const actual = xmlToJson(xml);
    // then
    expect(actual).toBeNull();
  });

  it('should return correct JSON (simple case)', () => {
    // given
    const xml = '<guestbook><guest><fname>Terje</fname><lname>Beck</lname></guest><guest><fname>Jan</fname><lname>Refsnes</lname></guest></guestbook>';
    // when
    const actual = xmlToJson(xml);
    // then
    expect(actual).toEqual({
      guestbook: {
        guest: [{
          fname: 'Terje',
          lname: 'Beck',
        }, {
          fname: 'Jan',
          lname: 'Refsnes',
        }],
      },
    });
  });

  it('should return correct JSON (complex case)', () => {
    // given
    // eslint-disable-next-line max-len
    const xml = '<?xml version="1.0" encoding="UTF-8"?><passages gare="87382002"><train><date mode="R">20/06/2017 12:46</date><num>135140</num><miss>POPI</miss><term>87384008</term><etat>Retardé</etat></train><train><date mode="R">20/06/2017 13:41</date><num>134626</num><miss>PEBU</miss><term>87384008</term></train><train><date mode="R">20/06/2017 13:41</date><num>135183</num><miss>NOPE</miss><term>87386318</term></train></passages>';
    // when
    const actual = xmlToJson(xml);
    // then
    expect(actual).toEqual({
      passages:{
        '$':{
          gare:'87382002',
        },
        train:[
          {
            date:{
              '$':{
                mode:'R',
              },
              _:'20/06/2017 12:46',
            },
            etat:'Retardé',
            miss:'POPI',
            num:'135140',
            term:'87384008',
          },
          {
            date:{
              '$':{
                mode:'R',
              },
              _:'20/06/2017 13:41',
            },
            miss:'PEBU',
            num:'134626',
            term:'87384008',
          },
          {
            date:{
              '$':{
                mode:'R',
              },
              _:'20/06/2017 13:41',
            },
            miss:'NOPE',
            num:'135183',
            term:'87386318',
          },
        ],
      },
    });
  });
});

describe('isXml function', () => {
  it('should return false when null data', () => {
    // given-when
    const actual = isXml(null);
    // then
    expect(actual).toBeFalsy();
  });

  it('should return false with JSON', () => {
    // given
    const json = { test: true };
    // when
    const actual = isXml(json);
    // then
    expect(actual).toBeFalsy();
  });

  it('should return true with XML', () => {
    // given
    const xml = '<?xml version="1.0" encoding="UTF-8"?><passages />';
    // when
    const actual = xmlToJson(xml);
    // then
    expect(actual).toBeTruthy();
  });
});
