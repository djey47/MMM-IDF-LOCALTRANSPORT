/* @flow */

/* Magic Mirror
 * Module: MMM-IDF-LOCALTRANSPORT
 * Server side part of module.
 */
// ES6 module export does not work here...

// $FlowFixMe: provided dependency (MM2)
const NodeHelper = require('node_helper');

const { ModuleDefinitions } = require('./helper_impl.js');

module.exports = NodeHelper.create(ModuleDefinitions);
