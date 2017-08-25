const Client = require('ftp');
const xml2js = require('xml2js');
const date = require('date-fns');
const db = require('./db');
const translate = require('./translate');
const log = require('./log');

// Bureau of Meteorology Public FTP Details
let config = {
  ftp: {
    host: 'ftp.bom.gov.au',
    port: 21
  },
  path: '/anon/gen/fwo/',
  xml: 'IDN11111.xml'
};

module.exports = {
  get: (cb) => {
    // Connect to the BoM's FTP server
    log(`Fetching weather from the Bureau of Meteorology...`);
    var ftp = new Client();
    ftp.connect(config.ftp);
    ftp.on('ready', () => {
      // Get the XML file contents as per config object
      ftp.get(config.path + config.xml, (err, stream) => {
        if (err) return cb(err);
        stream.once('close', () => { ftp.end(); });
        const chunks = [];
        stream.on('data', (chunk) => { chunks.push(chunk); });
        stream.on('end', () => {
          var parser = new xml2js.Parser({ trim: true, mergeAttrs: true });
          var xml = Buffer.concat(chunks);
          // Parse the XML
          parser.parseString(xml, (err, result) => {
            if (err) return cb(err);
            // Clear old records from DB
            log(`Clearing old forecast data from DB...`);
            db.get('forecast').remove().write();
            // Filter the parsed XML to only return forecast data for Orange
            var blob = result.product.forecast[0].area;
            var orange = blob.filter((items) => { return items.description[0] === 'Orange'; });
            // Update the DB's lastUpdated dates
            db.set('lastUpdated.date', date.format(new Date(), 'YYYY-MM-DDTHH:mm:ss')).write();
            db.set('lastUpdated.prettyDate', date.format(new Date(), 'dddd Do MMMM YYYY')).write();
            db.set('lastUpdated.prettyTime', date.format(new Date(), 'hh:mm A')).write();
            // Pass the filtered forecast data to translate()
            log(`Transforming XML...`);
            translate(orange[0]['forecast-period'], (res) => {
              // Push each returned array element to DB, callback
              for (var i = 0; i < res.length; i++) db.get('forecast').push(res[i]).write();
              cb(null, res.length);
            });
          });
        });
      });
    });
  }
};
