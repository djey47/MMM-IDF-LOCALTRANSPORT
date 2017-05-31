/* @flow */

/* Magic Mirror
 * Module: MMM-IDF-STIF-NAVITIA
 * Server side part of module.
 */

// $FlowFixMe: provided dependency (MM2)
const NodeHelperBase = require('node_helper');
const NodeHelperImpl = require('./src/server/node_helper_impl.js');

module.exports = NodeHelperBase.create(NodeHelperImpl);
