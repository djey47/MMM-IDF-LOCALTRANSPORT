/* @flow */

/* Magic Mirror
 * Module: MMM-IDF-STIF-NAVITIA
 * Server side part of module.
 */

// $FlowFixMe: provided dependency (MM2)
const NodeHelper = require('node_helper');

const NodeHelperImpl = require('./helper_impl.js');

module.exports = NodeHelper.create(NodeHelperImpl);
