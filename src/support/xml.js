const { parseString } = require('xml2js');

const options = { explicitArray: false }; 

/**
 * @param {String} xml XML string
 * @returns {Object} corresponding JS object
 */
function xmlToJson(xml) {
	// Create the return object
  let obj = null;

  parseString(xml, options, (err, result) => {
    if (!err) obj = result;
  });

  return obj;
}

module.exports = xmlToJson;
