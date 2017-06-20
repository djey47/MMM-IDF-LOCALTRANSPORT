/**
 * Modified version from here: http://davidwalsh.name/convert-xml-json
 * @param {any} xml DOM-parsed XML object
 * @returns corresponding JS object
 */
function xmlToJson(xml) {
	// Create the return object
  let obj = {};

  if (xml.nodeType == 1) { // element
		// do attributes
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j);
        const { nodeName, nodeValue } = attribute;
        obj['@attributes'][nodeName] = nodeValue;
      }
    }
  } else if (xml.nodeType == 3) { // text
    obj = xml.nodeValue;
  }

	// do children
	// If just one text node inside
  if (xml.hasChildNodes()
    && xml.childNodes.length === 1
    && xml.childNodes[0].nodeType === 3) {
    obj = xml.childNodes[0].nodeValue;
  }
  else if (xml.hasChildNodes()) {
    for(let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      const { nodeName } = item;
      if (typeof(obj[nodeName]) == 'undefined') {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof(obj[nodeName].push) == 'undefined') {
          const old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}

module.exports = xmlToJson;
