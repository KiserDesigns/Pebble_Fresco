// https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=csv&gid={SHEET_ID}
// https://www.papaparse.com/
// https://jsfiddle.net/noahkiser95/h5qrj7tc/270/
// https://virtual-graph-paper.com/index.html?edit=201155e1c240
// https://simonwep.github.io/pickr/

const keys = require('message_keys');

const numLayers = 25;

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
  //var url = 'return_to=https://cloudpebble.repebble.com/ide/emulator/config?' ;
  var url = 'https://frescostudio.net/' + '?platform=' + Pebble.getActiveWatchInfo().platform;
  Pebble.openURL(url);
});

Pebble.addEventListener('webviewclosed', function(e) {
  // Decode the user's preferences
  console.log(e.response);
  var configData = JSON.parse(e.response);
  //var configData = JSON.parse('{"background_color":11141120,"0":{"t":"rect","p":{"x":15,"y":15,"w":40,"h":40},"l":{"enabled":"true","outline":"true"},"s":{},"n":{"align":"left","wordWrap":"false","font":"18px gotham-light"},"r":20,"d":{},"f":65280,"b":11141120,"c":"%S/59"},"1":{"t":"rect","p":{"x":25,"y":25,"w":60,"h":20},"l":{"enabled":"true","outline":"true","inverter":"true"},"s":{},"n":{"align":"left","wordWrap":"false","font":"18px gotham-light"},"r":5,"d":{},"f":43690,"b":16777888,"c":"%S/59"},"2":{"t":"rect","p":{"x":40,"y":20,"w":60,"h":30},"l":{"enabled":"true","outline":"true","dither":"lr"},"s":{},"n":{"align":"left","wordWrap":"false","font":"18px gotham-light"},"r":10,"d":{},"f":22015,"b":16777888,"c":"%S/59"},"3":{"t":"text","p":{"x":20,"y":60,"w":100,"h":50},"l":{"enabled":"true","outline":"true"},"s":{},"n":{"align":"left","wordWrap":"true","font":"18px gotham-light"},"r":10,"d":{},"f":5592405,"b":16777888,"c":"Hello World a bb ccc dddd eeeee"},"4":{"l":{"enabled":"false"}},"5":{"l":{"enabled":"false"}},"6":{"l":{"enabled":"false"}},"7":{"l":{"enabled":"false"}},"8":{"l":{"enabled":"false"}},"9":{"l":{"enabled":"false"}},"10":{"l":{"enabled":"false"}},"11":{"l":{"enabled":"false"}},"12":{"l":{"enabled":"false"}},"13":{"l":{"enabled":"false"}},"14":{"l":{"enabled":"false"}},"15":{"l":{"enabled":"false"}},"16":{"l":{"enabled":"false"}},"17":{"l":{"enabled":"false"}},"18":{"l":{"enabled":"false"}},"19":{"l":{"enabled":"false"}},"20":{"l":{"enabled":"false"}},"21":{"l":{"enabled":"false"}},"22":{"l":{"enabled":"false"}},"23":{"l":{"enabled":"false"}},"24":{"l":{"enabled":"false"}}}');
  // Send to the watchapp via AppMessage
  var dict = {
    'MainBGColor': configData.background_color
    //'MainBGColor': 11141120
    //'TemperatureUnit': configData.temperature_checkbox,
  };
  
  //console.log(e.response);
  //console.log(decodeURIComponent(e.response));
  
  // Send to the watchapp
  Pebble.sendAppMessage(dict, function() {
    console.log('Config data sent successfully!');
  }, function(e) {
    console.log('Error sending config data!');
  });
  
  //return;

  let layerStatus = [];
  for (let i=0;i<numLayers;i++){
    layerStatus.push(0);
  }
  
  for (let i = 0; i < numLayers; i++){
    let layer = {};
    function configToMessage(i, obj, key){
      //console.log(configData[i], obj);
      //console.log(configData[i][obj]);
      layer[keys[key]+i] = configData[i][obj];
    }
    function subConfigToMessage(i, obj, sub, key){
      //console.log(configData[i], obj);
      //console.log(configData[i][obj], sub);
      //console.log(configData[i][obj][sub]);
      layer[keys[key]+i] = configData[i][obj][sub];
    }
    console.log(i);
    if ('l' in configData[i]){
      if (configData[i].l["enabled"] == 'true'){
        layer[keys['LayerSettings']+i] = 1;
        if (configData[i].l["outline"] == 'true'){
          layer[keys['LayerSettings']+i] += 2
        }
        if (configData[i].l["inverter"] == 'true'){
          layer[keys['LayerSettings']+i] += 16
        }
        if (configData[i].l["dither"] == 'lr'){
          layer[keys['LayerSettings']+i] += 4
        } else 
        if (configData[i].l["dither"] == 'ud'){
          layer[keys['LayerSettings']+i] += 8
        } else 
        if (configData[i].l["dither"] == 'mix'){
          layer[keys['LayerSettings']+i] += 12
        }
        layer[keys['Font']+i] = 0;
        if (configData[i].n["wordWrap"] == 'true'){
          layer[keys['Font']+i] += 128;
        }
        if (configData[i].n["align"] == 'left'){
          layer[keys['Font']+i] += 32;
        } else 
        if (configData[i].n["align"] == 'right'){
          layer[keys['Font']+i] += 96;
        } else 
        if (configData[i].n["align"] == 'center'){
          layer[keys['Font']+i] += 64;
        }

        let font = "";
        console.log(configData[i].n["font"]);
        switch (configData[i].n["font"]) {
          case "14px gothic-14":
            font = 1;
            break;
          case "14px gothic-bold-14":
            font = 2;
            break;
          case "18px gothic":
            font = 3;
            break;
          case "18px gothic-bold":
            font = 4;
            break;
          case "24px gothic":
            font = 5;
            break;
          case "24px gothic-bold":
            font = 6;
            break;
          case "28px gothic-14":
            font = 7;
            break;
          case "28px gothic-bold-14":
            font = 8;
            break;
          case "30px gotham-black":
            font = 9;
            break;
          case "34px gotham-medium":
            font = 10;
            break;
          case "42px gotham-bold":
            font = 11;
            break;
          case "42px gotham-light":
            font = 12;
            break;
          case "42px gotham-medium":
            font = 13;
            break;
          case "21px roboto-cond":
            font = 14;
            break;
          case "49px roboto-bold":
            font = 15;
            break;
          case "28px droid-bold":
            font = 16;
            break;
          case "20px leco-bold":
            font = 17;
            break;
          case "26px leco-bold":
            font = 18;
            break;
          case "28px leco-light":
            font = 19;
            break;
          case "32px leco-bold":
            font = 20;
            break;
          case "36px leco-bold":
            font = 21;
            break;
          case "38px leco-bold":
            font = 22;
            break;
          case "42px leco-regular":
            font = 23;
            break;
          case "60px leco-regular":
            font = 24;
            break;
          case "60px leco-black":
            font = 25;
            break;
          case "18px gotham-light":
            font = 26;
            break;
          case "34px gotham-light":
            font = 27;
            break;
          case "9px gothic":
            font = 28;
            break;
          default: font = 4;
        }
        layer[keys['Font']+i] += font;
        console.log(font, layer[keys['Font']+i]);
        configToMessage(i, "b", "BGColor");
        configToMessage(i, "f", "FGColor");
        configToMessage(i, "c", "Content");
        configToMessage(i, "r", "Radius");
        subConfigToMessage(i, "p", "x", "X");
        subConfigToMessage(i, "p", "y", "Y");
        subConfigToMessage(i, "p", "w", "W");
        subConfigToMessage(i, "p", "h", "H");
  
        let type = 0;
        switch (configData[i].t) {
          case 'text':
            type = 1;
            break;
          case 'image':
            type = 2;
            break;
          case 'dynamic':
            type = 3;
            break;
          case 'vector':
            type = 4;
            break;
          case 'analog':
            type = 5;
            break;
          case 'rect':
            type = 6;
            break;
          default:
            type = 6;
        } 
        layer[keys['Type']+i] = type;
        
      } else {
        layer[keys['LayerSettings']+i] = 0;
      }
    } else {
      layer[keys['LayerSettings']+i] = 0;
    }
     // Send to the watchapp
    Pebble.sendAppMessage(layer, function() {
      console.log('Layer ' + i + ' data sent successfully!');
      layerStatus[i] = 1;
      let sum = 0;
      for (let j = 0; j < numLayers; j++) {
        sum += layerStatus[j];
      }
      if (sum == numLayers){
        console.log('DONE SENDING LAYER INFO');
        Pebble.sendAppMessage({'SENDDONE':1}, function() {
          console.log('Sent DONE command');
        }, function(e) {
          console.log('Error sending done command');
        });
      }
    }, function(e) {
      console.log('Error sending layer ' + i + ' data, sending once more');
      Pebble.sendAppMessage(layer, function() {
        console.log('Layer ' + i + ' data sent successfully!');
        layerStatus[i] = 1;
        let sum = 0;
        for (let j = 0; j < numLayers; j++) {
          sum += layerStatus[j];
        }
        if (sum == numLayers){
          console.log('DONE SENDING LAYER INFO');
          Pebble.sendAppMessage({'SENDDONE':1}, function() {
            console.log('Sent DONE command');
          }, function(e) {
            console.log('Error sending done command');
          });
        }
      }, function(e) {
        console.log('Error sending layer ' + i + ' data, QUITTING!');
      });
    });
  }
  
  console.log('BGColor Key: ' + keys['BGColor']);
  
});