var argv, colors, logger, optimist, proxy, server;

colors = require('colors');

optimist = require('optimist');

argv = optimist.usage('Usage: node simple-proxy [options]')["default"]({
  'proxy': process.env.HTTP_PROXY,
  'port': 8180,
  'verbose': false,
  'help': false
}).argv;

if (argv.help) {
  optimist.showHelp();
  process.exit(1);
}

proxy = require('../lib/proxy');

logger = require('../lib/logger');

server = proxy.createServer(argv);

server.on('connection', function(connection) {
  var address, port;
  address = connection.client.remoteAddress;
  port = connection.client.remotePort;
  console.log(("" + connection.id + " Connection from " + address + ":" + port).green);
  connection.on('error', function(error, received) {
    console.log(("" + connection.id + " (" + address + ":" + port + ") " + (error.toString())).red);
    return console.log(("" + connection.id).red, received);
  });
  return connection.on('requested', function(connection) {
    var dest, encoding, id, method;
    dest = connection.dest;
    id = connection.id;
    method = connection.method;
    console.log(("" + id + " " + method + " " + dest.host).cyan);
    if (argv.verbose) {
      encoding = method === 'CONNECT' ? 'binary' : 'utf8';
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
      return console.log(text.cyan);
    });
    return connection.once('end', function() {
      return console.log(("" + id + " [end]").yellow);
    });
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
  console.error('UncaughtException'.red);
  console.error((error.stack || error.toString()).red);
  return process.exit(1);
});
