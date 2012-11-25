# CoffeeScript HTTP Proxy

Simple HTTP proxy server module.

The proxy module supports:
 - Proxy HTTP and HTTPS protocols
 - Proxying via proxy server
 - Customize behavior for each request
   (deny, change proxy, change host/port etc.)
 - Customize logging

Modules are written in CoffeeScript.
Proxy module itself (`src/proxy.coffee`) is small, about 100 lines.

## Usage

```coffeescript
proxy = require 'coffee-http-proxy'

server = proxy.createServer()

server.listen 8000, ->
  console.log 'Listening on port', 8000
```

```javascript
var proxy = require('coffee-http-proxy');

var server = proxy.createServer();

server.listen(8000, function() {
  console.log('Listening on port', 8000);
});
```

For detail usage, see `src/simple-proxy.coffee`.

## Simple Proxy Server

Simple proxy server with command line options and logging feature.

```bash
node lib/simple-proxy [--port 8000] [--proxy host:port] [--verbose]
```
