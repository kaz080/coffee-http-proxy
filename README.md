# CoffeeScript HTTP Proxy

Simple HTTP proxy server module.

The proxy module supports:

 - Proxy HTTP and HTTPS protocols
 - Proxying via proxy server
 - Customize behavior for each request
   (deny, change proxy, change host/port etc.)
 - Customize logging

This module just relay TCP connection according to HTTP Request.
Modules are written in [CoffeeScript](http://coffeescript.org/).
So proxy module itself (`src/proxy.coffee`) is small, about 120 lines.

## Usage

In CoffeeScript,

```coffeescript
proxy = require 'coffee-http-proxy'

server = proxy.createServer()

server.listen 8000, ->
  console.log 'Listening on port', 8000
```

In JavaScript,

```javascript
var proxy = require('coffee-http-proxy');

var server = proxy.createServer();

server.listen(8000, function() {
  console.log('Listening on port', 8000);
});
```

To start proxy server,

```bash
proxy [--port 8000] [--proxy host:port] [--verbose]
```

For more detail, see `src/simple-proxy.coffee`.

## Install

```bash
npm install coffee-http-proxy
```

# Development Environment

In the module directory,

- Install [grunt.js](https://github.com/gruntjs/grunt):
  `npm install -g grunt`
- Install development dependencies:
  `npm install --dev`
- Build and test:
  `grunt`
- Start watching code editing:
  `grunt watch`
