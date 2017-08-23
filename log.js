const date = require('date-fns');

module.exports = (msg) => {
  var now = date.format(new Date(), 'YYYY-MM-DDTHH:mm:ss');
  console.log(`[${now}] ${msg}`);
};
