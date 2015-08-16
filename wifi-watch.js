var HOME_NETWORK_SSID;
var HOME_NETWORK_PASSWORD;
var DEVICE_NAME;

var fs = require('fs');
var path = require('path');
var http = require('http');
var exec = require('child_process').exec;

fs.readFile(path.join(__dirname, 'network.json'), {encoding: 'utf-8'}, function(error, data){
  if (!error){
    var settings = JSON.parse(data);

    HOME_NETWORK_SSID = settings.ssid;
    HOME_NETWORK_PASSWORD = settings.password;
    DEVICE_NAME = settings.device_name;

    setInterval(init, 30 * 1000);
    init();

  }
});

var connectionCheckInProgress = false;
var connectionInterval;

function isHomeNetwork(callback){
  exec('networksetup -getairportnetwork ' + DEVICE_NAME, function(error, stdout, stderr){
    var network = stdout.replace('Current Wi-Fi Network: ', '').trim();
    if (network === 'NETGEAR16') { 
      console.log('Network status: Connected to home network;', new Date());
      callback(true);
    }
    else if (network === 'You are not associated with an AirPort network.') {
      console.log('Network status: Not connected to any network;', new Date());
      callback(false);
    }
    else {
      console.log('Network status: Connected to non-home network:', network + ';', new Date());
      callback(false);
    }
  });
};

function isConnected(callback){
  var timer = setTimeout(function(){
    callback(false);
  }, 5000);
  http.get('http://www.speedtest.net/', function(response){
    console.log('Online...');
    clearTimeout(timer);
    callback(true);
  }).on('error', function(e) {
    console.error('Error: offline;', new Date());
    clearTimeout(timer);
    callback(false);
  });
}

function reconnectWiFi(callback){
  var airportDir = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources';
  var command = airportDir + '/airport -z && networksetup -setairportnetwork '
    + DEVICE_NAME + ' '
    + HOME_NETWORK_SSID + ' '
    + HOME_NETWORK_PASSWORD;
  exec(command, function(error, stdout, stderr){
    console.log('Reconnected to WiFi');
    callback();
  });
}

function startConnectionCheckOnInterval(onError, onDisconnect){
  console.log('Started connection check on interval');
  connectionCheckInProgress = true;
  connectionInterval = setInterval(function(){
    isConnected(function(online, status){
      if (!online) {
        stopConnectionCheckOnInterval();
        isHomeNetwork(function(success){
          if (success) {
            // error
            onError();
          }
          else {
            // manual disconnect
            onDisconnect();
          }
        });
      }
    });
  }, 6000);
}

function stopConnectionCheckOnInterval(){
  console.log('Stopped connection check on interval');
  connectionCheckInProgress = false;
  clearInterval(connectionInterval);
}

function watchConnection(){
  console.log('Started watching connection');
  startConnectionCheckOnInterval(function(){
    // Bad connection
    console.log('Reconnecting WiFi...');
    reconnectWiFi(watchConnection);
  }, function(){
    // User manually disconnected from home network
    console.log('User manually disconnected from home network. Stopping watching connection')
  });
}

function init(){
  isHomeNetwork(function(success){
    if (success) {
      if (!connectionCheckInProgress) {
        // start connectionCheck
        console.log('Connected to home network but connection check hasn\'t started yet, therefore starting check...');
        watchConnection();
      }
    }
    else {
      if (connectionCheckInProgress) {
        // stop connectionCheck
        console.log('Connected to non-home network but connection check is still ongoing, therefore stopped check');
        stopConnectionCheckOnInterval();
      }
    }
  });
};

