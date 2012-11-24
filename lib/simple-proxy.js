var argv, colors, logger, proxy, server;

colors = require('colors');

argv = require('optimist').usage('Usage: coffee simple-proxy')["default"]({
  'proxy': process.env.HTTP_PROXY,
  'port': 8180
}).argv;

proxy = require('../lib/proxy');

logger = require('../lib/logger');

server = proxy.createServer(argv);

server.on('connection', function(connection) {
  var address, dest, encoding, id, port;
  address = connection.client.remoteAddress;
  port = connection.client.remotePort;
  dest = connection.dest;
  id = connection.id;
  console.log(("" + id + " Connection from " + address + ":" + port + " to " + dest.hostname + ":" + dest.port).yellow);
  if (argv.verbose) {
    encoding = connection.method === 'CONNECT' ? 'binary' : 'utf8';
    connection.log_sc = logger((id + '<').green, encoding);
    connection.log_cs = logger((id + '>').yellow, encoding);
  }
  connection.once('connected', function(connection) {
    var text;
    text = "" + id + " Connected";
    proxy = connection.proxy;
    if (proxy) {
      text += " via proxy " + proxy.hostname + ":" + proxy.port;
    }
    return console.log(text.green);
  });
  return connection.on('error', function(error) {
    return console.log(error.toText().red);
  });
});

server.listen(argv.port, function() {
  return console.log('Listening on port', argv.port);
});

server.on('error', function(error) {
  console.log(error.toString().yellow);
  return process.exit(1);
});

process.on('uncaughtException', function(error) {
  console.error((error.stack || error.toString()).red);
  return process.exit(1);
});
