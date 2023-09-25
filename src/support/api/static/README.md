DATA SOURCE
===========

To update referential, export those results to JSON then replace contents of corresponding .json files.

- Lines: https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/export/?disjunctive.transportmode&disjunctive.transportsubmode&disjunctive.operatorname&disjunctive.networkname&refine.transportmode=rail

- Stops: https://data.iledefrance-mobilites.fr/explore/dataset/arrets/export/?refine.arrtype=rail

Make sure to replace unicode characters \uxxxx with simplified values (a,e,u etc...) to give better search results.
(or use a better normalization library to take thoses cases into account?, see https://www.npmjs.com/package/normalize-unicode-text).
