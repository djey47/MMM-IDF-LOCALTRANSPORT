const records = require('./records.json');

module.exports = {
  path: '/sncf/search',
  method: 'get',
  status: ({ query: { q }}, res, next) => {
    if (!records[q]) {
      res.status(404);
    }
    next();
  },
  template: {
    nhits: 1,
    parameters: {
      dataset: [
        'sncf-gares-et-arrets-transilien-ile-de-france',
      ],
      timezone: 'UTC',
      q: (params, { q }) => q,
      rows: 10,
      format: 'json',
    },
    records: (params, { q }) => [records[q]],
  },
};
