# WiFi Watch
Node.js script that watches WiFi connection in Mac OS in the background and auto-reconnects if it fails. The script watches only the network specified in `network.json`.

### Usage
`sudo node wifi-watch.js`

### network.js
 See `network-example.js` as an example
```json
{
  "ssid": "MOTOROLA123",
  "password": "testpassword",
  "device_name": "en0" 
}
```
`ssid` — WiFi network name  
`password` — WiFi password  
`device_name` — Mac OS airport interface, could be en0, en1, en2 ect. Run `networksetup -listallhardwareports` in terminal to find it
