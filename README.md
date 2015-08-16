# WiFi Watch
Node.js script that watches WiFi connection in Mac OS in the background and auto-reconnects if it fails. The script watches only the network specified in file `network.json`.

### Usage
1. Create file `network.json` next to `wifi-watch.js`. Put network settings there (see details below)
2. Run `sudo node wifi-watch.js`

### File network.json
 See `network-example.js` as an example
```json
{
  "ssid": "MOTOROLA123",
  "password": "testpassword",
  "device_name": "en0" 
}
```
##### Values
* `ssid` -- name of a WiFi network that should be watched  
* `password` -- WiFi password  
* `device_name` -- Mac OS airport interface, could be en0, en1, en2 ect. Run `networksetup -listallhardwareports` in terminal to find it
