/**
 * Citymapper API
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

/**
 * Transilien API
 */
function addMinutesAndFormatWithDate(mmt, minutes) {
  return mmt.add(minutes, 'minutes').format('DD/MM/YYYY HH:mm');
}

module.exports = {
  addMinutesAndFormat,
  extractLineFromRoute,
  generateCallInfo,
  addMinutesAndFormatWithDate,
};