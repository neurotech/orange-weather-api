const http = require('http');
const schedule = require('node-schedule');
const weather = require('./weather');
const db = require('./db');
const log = require('./log');

let everyHour = `15 * * * *`;

// Setup DB schema
db.defaults({ forecast: [], lastUpdated: {} }).write();

// Start a simple HTTP server to serve forecast data as JSON
log('Starting HTTP server...');
http.createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  if (request.url === '/') {
    var forecasts = {
      lastUpdated: db.get('lastUpdated').value(),
      forecasts: db.get('forecast').value()
    };
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(forecasts), 'utf-8');
  } else {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end('404 Not Found\n', 'utf-8');
  }
}).listen(3000);

// Schedule weather.get() to run every hour at 15 minutes past
schedule.scheduleJob(everyHour, () => {
  weather.get((err, res) => {
    if (err) throw err;
    log(`Updated DB with ${res} days of forecast data.`);
  });
});

// Seed database with a one off weather.get()
weather.get((err, res) => {
  if (err) throw err;
  log(`Seeded DB with ${res} days of forecast data.`);
});
