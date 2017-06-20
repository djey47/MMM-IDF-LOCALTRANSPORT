/* @flow */

import xmlToJson from './xml';

describe('xmlToJson function', () => {
  it('should return correct JSON (simple case)', () => {
    // given
    const xml = '<guestbook><guest><fname>Terje</fname><lname>Beck</lname></guest><guest><fname>Jan</fname><lname>Refsnes</lname></guest></guestbook>';
    const xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');
    // when
    const actual = xmlToJson(xmlDoc);
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
    const xml = '<?xml version="1.0" encoding="UTF-8"?><passages gare="87382002"><train><date mode="R">20/06/2017 12:46</date><num>135140</num><miss>POPI</miss><term>87384008</term><etat>Retardé</etat></train><train><date mode="R">20/06/2017 13:41</date><num>134626</num><miss>PEBU</miss><term>87384008</term></train><train><date mode="R">20/06/2017 13:41</date><num>135183</num><miss>NOPE</miss><term>87386318</term></train><train><date mode="R">20/06/2017 13:45</date><num>135162</num><miss>POPI</miss><term>87384008</term></train><train><date mode="R">20/06/2017 13:50</date><num>134625</num><miss>SEBU</miss><term>87382481</term></train><train><date mode="R">20/06/2017 13:51</date><num>135189</num><miss>NOPE</miss><term>87386318</term></train><train><date mode="R">20/06/2017 13:53</date><num>135164</num><miss>POPI</miss><term>87384008</term></train><train><date mode="R">20/06/2017 13:56</date><num>134630</num><miss>PEBU</miss><term>87384008</term></train><train><date mode="R">20/06/2017 14:01</date><num>135193</num><miss>NOPE</miss><term>87386318</term></train><train><date mode="R">20/06/2017 14:03</date><num>135168</num><miss>POPI</miss><term>87384008</term></train><train><date mode="R">20/06/2017 14:05</date><num>134629</num><miss>SEBU</miss><term>87382481</term></train><train><date mode="R">20/06/2017 14:11</date><num>134632</num><miss>PEBU</miss><term>87384008</term></train><train><date mode="R">20/06/2017 14:11</date><num>135195</num><miss>NOPE</miss><term>87386318</term></train><train><date mode="R">20/06/2017 14:13</date><num>135172</num><miss>POPI</miss><term>87384008</term></train><train><date mode="R">20/06/2017 14:20</date><num>134631</num><miss>SEBU</miss><term>87382481</term></train><train><date mode="R">20/06/2017 14:21</date><num>135203</num><miss>NOPE</miss><term>87386318</term></train><train><date mode="R">20/06/2017 14:23</date><num>135174</num><miss>POPI</miss><term>87384008</term></train><train><date mode="R">20/06/2017 14:26</date><num>134636</num><miss>PEBU</miss><term>87384008</term></train><train><date mode="R">20/06/2017 14:31</date><num>135205</num><miss>NOPE</miss><term>87386318</term></train><train><date mode="R">20/06/2017 14:33</date><num>135182</num><miss>POPI</miss><term>87384008</term></train><train><date mode="R">20/06/2017 14:35</date><num>134635</num><miss>SEBU</miss><term>87382481</term></train><train><date mode="R">20/06/2017 14:41</date><num>134638</num><miss>PEBU</miss><term>87384008</term></train><train><date mode="R">20/06/2017 14:41</date><num>135209</num><miss>NOPE</miss><term>87386318</term></train><train><date mode="R">20/06/2017 14:43</date><num>135184</num><miss>POPI</miss><term>87384008</term></train><train><date mode="R">20/06/2017 14:50</date><num>134637</num><miss>SEBU</miss><term>87382481</term></train><train><date mode="R">20/06/2017 14:51</date><num>135213</num><miss>NOPE</miss><term>87386318</term></train><train><date mode="R">20/06/2017 14:53</date><num>135188</num><miss>POPI</miss><term>87384008</term></train><train><date mode="R">20/06/2017 14:56</date><num>134642</num><miss>PEBU</miss><term>87384008</term></train><train><date mode="R">20/06/2017 15:01</date><num>135219</num><miss>NOPE</miss><term>87386318</term></train></passages>';
    const xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');
    // when
    const actual = xmlToJson(xmlDoc);
    // then
    expect(actual).toEqual({
      passages: {
        '@attributes': {
          gare: '87382002',
        },
        train: [{
          date: '20/06/2017 12:46',
          etat: 'Retardé',
          miss: 'POPI',
          num: '135140',
          term: '87384008',
        }, {
          date: '20/06/2017 13:41',
          miss: 'PEBU',
          num: '134626',
          term: '87384008',
        }, {
          date: '20/06/2017 13:41',
          miss: 'NOPE',
          num: '135183',
          term: '87386318',
        }, {
          date: '20/06/2017 13:45',
          miss: 'POPI',
          num: '135162',
          term: '87384008',
        }, {
          date: '20/06/2017 13:50',
          miss: 'SEBU',
          num: '134625',
          term: '87382481',
        }, {
          date: '20/06/2017 13:51',
          miss: 'NOPE',
          num: '135189',
          term: '87386318',
        }, {
          date: '20/06/2017 13:53',
          miss: 'POPI',
          num: '135164',
          term: '87384008',
        }, {
          date: '20/06/2017 13:56',
          miss: 'PEBU',
          num: '134630',
          term: '87384008',
        }, {
          date: '20/06/2017 14:01',
          miss: 'NOPE',
          num: '135193',
          term: '87386318',
        }, {
          date: '20/06/2017 14:03',
          miss: 'POPI',
          num: '135168',
          term: '87384008',
        }, {
          date: '20/06/2017 14:05',
          miss: 'SEBU',
          num: '134629',
          term: '87382481',
        }, {
          date: '20/06/2017 14:11',
          miss: 'PEBU',
          num: '134632',
          term: '87384008',
        }, {
          date: '20/06/2017 14:11',
          miss: 'NOPE',
          num: '135195',
          term: '87386318',
        }, {
          date: '20/06/2017 14:13',
          miss: 'POPI',
          num: '135172',
          term: '87384008',
        }, {
          date: '20/06/2017 14:20',
          miss: 'SEBU',
          num: '134631',
          term: '87382481',
        }, {
          date: '20/06/2017 14:21',
          miss: 'NOPE',
          num: '135203',
          term: '87386318',
        }, {
          date: '20/06/2017 14:23',
          miss: 'POPI',
          num: '135174',
          term: '87384008',
        }, {
          date: '20/06/2017 14:26',
          miss: 'PEBU',
          num: '134636',
          term: '87384008',
        }, {
          date: '20/06/2017 14:31',
          miss: 'NOPE',
          num: '135205',
          term: '87386318',
        }, {
          date: '20/06/2017 14:33',
          miss: 'POPI',
          num: '135182',
          term: '87384008',
        }, {
          date: '20/06/2017 14:35',
          miss: 'SEBU',
          num: '134635',
          term: '87382481',
        }, {
          date: '20/06/2017 14:41',
          miss: 'PEBU',
          num: '134638',
          term: '87384008',
        }, {
          date: '20/06/2017 14:41',
          miss: 'NOPE',
          num: '135209',
          term: '87386318',
        }, {
          date: '20/06/2017 14:43',
          miss: 'POPI',
          num: '135184',
          term: '87384008',
        }, {
          date: '20/06/2017 14:50',
          miss: 'SEBU',
          num: '134637',
          term: '87382481',
        }, {
          date: '20/06/2017 14:51',
          miss: 'NOPE',
          num: '135213',
          term: '87386318',
        }, {
          date: '20/06/2017 14:53',
          miss: 'POPI',
          num: '135188',
          term: '87384008',
        }, {
          date: '20/06/2017 14:56',
          miss: 'PEBU',
          num: '134642',
          term: '87384008',
        }, {
          date: '20/06/2017 15:01',
          miss: 'NOPE',
          num: '135219',
          term: '87386318',
        }],
      },
    });
  });
});
