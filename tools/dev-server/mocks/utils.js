/**
 * Citymapper API
 * @param {string} route 
 */
function extractLineFromRoute(route) {
  const [, line] = route.split('-');
  return line || '';
}

/** 
 * Legacy API
 */
function addMinutesAndFormat(mmt, minutes) {
  return mmt.add(minutes, 'minutes').format('HH:mm');
}

function generateCallInfo(type, query) {
  return `GET /${type}/${query[0]}`;
}

module.exports = {
  addMinutesAndFormat,
  extractLineFromRoute,
  generateCallInfo,
};