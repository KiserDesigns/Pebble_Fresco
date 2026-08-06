// https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=csv&gid={SHEET_ID}
// https://www.papaparse.com/
// https://jsfiddle.net/noahkiser95/h5qrj7tc/270/
// https://virtual-graph-paper.com/index.html?edit=201155e1c240
// https://simonwep.github.io/pickr/

const Keys = require('message_keys');

// Helper function for XMLHttpRequest
var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};

// Convert Open-Meteo weather code to human-readable condition
function weatherCodeToCondition(code) {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Cloudy';
  if (code <= 48) return 'Fog';
  if (code <= 55) return 'Drizzle';
  if (code <= 57) return 'Fz. Drizzle';
  if (code <= 65) return 'Rain';
  if (code <= 67) return 'Fz. Rain';
  if (code <= 75) return 'Snow';
  if (code <= 77) return 'Snow Grains';
  if (code <= 82) return 'Showers';
  if (code <= 86) return 'Snow Shwrs';
  if (code === 95) return 'T-Storm';
  if (code <= 99) return 'T-Storm';
  return 'Unknown';
}

function locationSuccess(pos) {
  // Construct Open-Meteo API URL
  var url = 'https://api.open-meteo.com/v1/forecast?' +
      'latitude=' + pos.coords.latitude +
      '&longitude=' + pos.coords.longitude +
      '&current=temperature_2m,weather_code';

  // Send request to Open-Meteo
  xhrRequest(url, 'GET',
    function(responseText) {
      var json = JSON.parse(responseText);

      // Temperature (already in Celsius)
      var temperature = Math.round(json.current.temperature_2m);
      console.log('Temperature is ' + temperature);

      // Conditions from weather code
      var conditions = weatherCodeToCondition(json.current.weather_code);
      console.log('Conditions are ' + conditions);

      // Assemble dictionary
      var dictionary = {
        'TEMPERATURE': temperature,
        'CONDITIONS': conditions
      };

      // Send to Pebble
      Pebble.sendAppMessage(dictionary,
        function(e) {
          console.log('Weather info sent to Pebble successfully!');
        },
        function(e) {
          console.log('Error sending weather info to Pebble!');
        }
      );
    }
  );
}

function locationError(err) {
  console.log('Error requesting location!');
}

function getWeather() {
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError,
    { timeout: 15000, maximumAge: 60000 }
  );
}

// Listen for when the watchface is opened
Pebble.addEventListener('ready',
  function(e) {
    console.log('PebbleKit JS ready!');

    // Get the initial weather
    getWeather();
    
    // tell watch it's ready
    Pebble.sendAppMessage({'JSReady': 1});
  }
);

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function(e) {
    console.log('AppMessage received!');
    // Check if this is a weather refresh request
    if (e.payload['REQUEST_WEATHER']) {
      getWeather();
    }
  }
);

Pebble.addEventListener('showConfiguration', function() {
  var url = 'return_to=https://cloudpebble.repebble.com/ide/emulator/config?' + '?platform=' + Pebble.getActiveWatchInfo().platform;

  Pebble.openURL(url);
});

Pebble.addEventListener('webviewclosed', function(e) {
  // Decode the user's preferences
  //var configData = JSON.parse(decodeURIComponent(e.response));
  var configData = JSON.parse('{"0":{"t":"rect","p":{"x":15,"y":15,"w":40,"h":40},"l":{"enabled":"true","outline":"true"},"s":{},"n":{"align":"left","wordWrap":"false","font":"18px gotham-light"},"r":20,"d":{},"f":65280,"b":11141120,"c":"%S/59"},"1":{"t":"rect","p":{"x":25,"y":25,"w":60,"h":20},"l":{"enabled":"true","outline":"true","inverter":"true"},"s":{},"n":{"align":"left","wordWrap":"false","font":"18px gotham-light"},"r":5,"d":{},"f":43690,"b":0,"c":"%S/59"},"2":{"t":"rect","p":{"x":40,"y":20,"w":60,"h":30},"l":{"enabled":"true","outline":"true","dither":"lr"},"s":{},"n":{"align":"left","wordWrap":"false","font":"18px gotham-light"},"r":10,"d":{},"f":22015,"b":0,"c":"%S/59"},"3":{"t":"text","p":{"x":20,"y":60,"w":100,"h":50},"l":{"enabled":"true","outline":"true"},"s":{},"n":{"align":"left","wordWrap":"true","font":"18px gotham-light"},"r":10,"d":{},"f":16777215,"b":0,"c":"Hello World a bb ccc dddd eeeee"},"4":{"l":{"enabled":"false"}},"5":{"l":{"enabled":"false"}},"6":{"l":{"enabled":"false"}},"7":{"l":{"enabled":"false"}},"8":{"l":{"enabled":"false"}},"9":{"l":{"enabled":"false"}},"10":{"l":{"enabled":"false"}},"11":{"l":{"enabled":"false"}},"12":{"l":{"enabled":"false"}},"13":{"l":{"enabled":"false"}},"14":{"l":{"enabled":"false"}},"15":{"l":{"enabled":"false"}},"16":{"l":{"enabled":"false"}},"17":{"l":{"enabled":"false"}},"18":{"l":{"enabled":"false"}},"19":{"l":{"enabled":"false"}},"20":{"l":{"enabled":"false"}},"21":{"l":{"enabled":"false"}},"22":{"l":{"enabled":"false"}},"23":{"l":{"enabled":"false"}},"24":{"l":{"enabled":"false"}},"background_color":5592320}');
  // Send to the watchapp via AppMessage
  var dict = {
    'MainBGColor': configData.background_color,
    'MainFGColor': configData.foreground_color,
    'TemperatureUnit': configData.temperature_checkbox,
    'BGColor' : 0,
    'FGColor' : 0,
    'LayerSettings' : 0,
    'ContentSettings' : 0,
    'Radius' : 0,
    'X' : 0,
    'Y' : 0,
    'W' : 0,
    'H' : 0,
    'Type' : 0,
    'Font' : 0,
    'Dynamic' : 0,
    'Content' : 0
  };
  console.log(e.response);
  console.log(decodeURIComponent(e.response));
  
  // Send to the watchapp
  Pebble.sendAppMessage(dict, function() {
    console.log('Config data sent successfully!');
  }, function(e) {
    console.log('Error sending config data!');
  });     
  
  console.log('BGColor Key: ' + Keys['BGColor']);
  
});