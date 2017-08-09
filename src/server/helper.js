/* @flow */

/* Magic Mirror
 * Module: MMM-IDF-STIF-NAVITIA
 * Server side part of module.
 */

// $FlowFixMe: provided dependency (MM2)
const NodeHelper = require('node_helper');

const NodeHelperImpl = require('./helper_impl.js');

// ES6 module export does not work here...
module.exports = NodeHelper.create(NodeHelperImpl);
