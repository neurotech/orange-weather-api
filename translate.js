const date = require('date-fns');

let niceDate = 'dddd Do MMMM YYYY';
let icons = {
  '1': 'sunny',
  '2': 'clear',
  '3': 'partly_cloudy',
  '4': 'cloudy',
  '6': 'hazy',
  '8': 'light_rain',
  '9': 'windy',
  '10': 'fog',
  '11': 'shower',
  '12': 'rain',
  '13': 'dusty',
  '14': 'frost',
  '15': 'snow',
  '16': 'storm',
  '17': 'light_rain'
};

let dataHandler = (text, element) => {
  var values = {
    iconId: '',
    iconName: '',
    precise: '',
    summary: '',
    rainChance: '',
    rainfall: '0 mm',
    temperatures: {
      min: '',
      max: '',
      units: ''
    }
  };

  // Iterate over the 'text' array and update appropriate keys in the values object.
  for (var t = 0; t < text.length; t++) {
    if (text[t].type[0] === 'precis') values.precise = text[t]._;
    if (text[t].type[0] === 'forecast') values.summary = text[t]._;
    if (text[t].type[0] === 'probability_of_precipitation') values.rainChance = text[t]._.replace(/%/g, '');
  }

  // Iterate over the 'element' array and update appropriate keys in the values object.
  for (var e = 0; e < element.length; e++) {
    if (element[e].type[0] === 'forecast_icon_code') values.iconId = element[e]._;
    if (element[e].type[0] === 'forecast_icon_code') values.iconName = icons[element[e]._];
    if (element[e].type[0] === 'precipitation_range') values.rainfall = element[e]._;
    if (element[e].type[0] === 'air_temperature_minimum') values.temperatures.min = element[e]._;
    if (element[e].type[0] === 'air_temperature_maximum') values.temperatures.max = element[e]._;
    if (element[e].type[0] === 'air_temperature_maximum') values.temperatures.units = element[e].units[0];
  }

  return values;
};

module.exports = (data, cb) => {
  // Build array of translated data and callback with it when done
  var translated = [];
  for (var i = 0; i < data.length; i++) {
    translated.push({
      index: data[i].index[0],
      date: data[i]['start-time-local'][0],
      prettyDate: date.format(data[i]['start-time-local'][0], niceDate),
      forecast: dataHandler(data[i].text, data[i].element)
    });
  }
  cb(translated);
};
