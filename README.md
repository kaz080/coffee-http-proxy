# CoffeeScript HTTP Proxy

Simple HTTP proxy server module written in CoffeeScript.

This supports:
 - Proxy HTTP and HTTPS protocols
 - Proxying via proxy server
 - Customize destination, next proxy or reject according to request header
 - Customize logging

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

## Simple Proxy Server

```bash
node lib/simple-proxy --port 8000 --proxy host:port --verbose
```
