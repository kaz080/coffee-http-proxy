var BREAK, CONNECT_BAD_GATEWAY, CONNECT_OK, CRLF, Connection, Server, buffer, events, net, parseHTTPHeader, pipeline, stream, url, wait_for,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

stream = require('stream');

buffer = require('buffer');

pipeline = function(streams) {
  var p, _i, _len;
  p = streams.shift();
  for (_i = 0, _len = streams.length; _i < _len; _i++) {
    stream = streams[_i];
    if (stream) {
      p = p.pipe(stream);
    }
  }
  return p;
};

wait_for = function(token, stream, timeout, cb) {
  var chunks, listener, text;
  if (typeof cb !== 'function') {
    throw new Error('cb should be a function');
  }
  chunks = [];
  text = '';
  if (timeout) {
    setTimeout(function() {
      var error;
      error = new Error("Wait token timeout (" + timeout + "ms)");
      if (typeof cb === "function") {
        cb(error, buffer.Buffer.concat(chunks));
      }
      return cb = null;
    }, timeout);
  }
  return stream.on('data', listener = function(chunk) {
    var found;
    chunks.push(chunk);
    text += chunk.toString();
    found = text.indexOf(token);
    if (found > -1) {
      stream.removeListener('data', listener);
      if (typeof cb === "function") {
        cb(null, buffer.Buffer.concat(chunks));
      }
      return cb = null;
    }
  });
};

url = require('url');

net = require('net');

events = require('events');

CRLF = '\r\n';

BREAK = CRLF + CRLF;

CONNECT_OK = 'HTTP/1.1 200 Connection Established' + BREAK;

CONNECT_BAD_GATEWAY = 'HTTP/1.1 502 Bad Gateway' + BREAK;

parseHTTPHeader = function(chunk) {
  var dest, header, lines, req, req_url;
  header = chunk.toString();
  lines = header.split(CRLF);
  req = lines[0].split(' ');
  req_url = req[1];
  if (req[0] === 'CONNECT') {
    req_url = 'https://' + req_url;
  }
  dest = url.parse(req_url);
  return [req[0], dest, req[2], lines.slice(1)];
};

Connection = (function(_super) {
  var next_id;

  __extends(Connection, _super);

  next_id = 0;

  function Connection(opts) {
    var _ref, _ref1, _ref2;
    this.opts = opts;
    this.id = "[" + (next_id++) + "]";
    this.state = 'INITIAL';
    this.client = this.remote = null;
    this.proxy = ((_ref = this.opts) != null ? _ref.proxy : void 0) || null;
    this.log_cs = ((_ref1 = this.opts) != null ? _ref1.log_cs : void 0) || null;
    this.log_sc = ((_ref2 = this.opts) != null ? _ref2.log_sc : void 0) || null;
  }

  Connection.prototype.listen = function(socket) {
    var _this = this;
    this.client = socket;
    return wait_for(BREAK, socket, 5000, function(error, received) {
      var _base, _ref, _ref1;
      _this.received = received;
      if (error) {
        _this.emit('error', error, _this.received);
        _this.end();
        return;
      }
      try {
        _ref = parseHTTPHeader(_this.received), _this.method = _ref[0], _this.dest = _ref[1], _this.httpVersion = _ref[2], _this.headers = _ref[3];
      } catch (error) {
        _this.emit('error', error);
        _this.end();
        return;
      }
      if ((_ref1 = (_base = _this.dest).port) == null) {
        _base.port = {
          'http:': 80,
          'https:': 443
        }[_this.dest.protocol];
      }
      _this.state = 'REQUESTED';
      _this.emit('requested', _this);
      return _this.connect();
    });
  };

  Connection.prototype.connect = function() {
    var remote, _base, _ref,
      _this = this;
    if (this.state !== 'REQUESTED') {
      return;
    }
    this.state = 'CONNECTING';
    if (this.proxy) {
      if (typeof this.proxy === 'string') {
        this.proxy = url.parse('http://' + this.proxy);
      }
      if ((_ref = (_base = this.proxy).port) == null) {
        _base.port = 80;
      }
    }
    remote = this.proxy || this.dest;
    this.remote = net.connect(remote.port, remote.hostname, function() {
      pipeline([_this.remote, _this.log_sc, _this.client, _this.log_cs, _this.remote]);
      if (_this.proxy) {
        _this.remote.write(_this.received);
      } else if (_this.method !== 'CONNECT') {
        _this.remote.write(("" + _this.method + " " + _this.dest.path + " " + _this.httpVersion) + CRLF);
        _this.remote.write(_this.headers.join(CRLF));
      } else {
        _this.client.write(CONNECT_OK);
      }
      _this.state = 'CONNECTED';
      return _this.emit('connected', _this);
    });
    this.remote.once('error', function(error) {
      _this.emit('error', error);
      return _this.bad_gateway(error);
    });
    return this.remote.once('end', function() {
      return _this.emit('end');
    });
  };

  Connection.prototype.bad_gateway = function(error) {
    this.client.write(CONNECT_BAD_GATEWAY);
    this.client.write('<h1>502 Bad Gateway</h1>' + CRLF);
    this.client.write(error.toString() + CRLF);
    return this.end();
  };

  Connection.prototype.end = function() {
    var _ref, _ref1;
    if ((_ref = this.destination) != null) {
      _ref.end();
    }
    if ((_ref1 = this.client) != null) {
      _ref1.end();
    }
    this.destination = this.client = null;
    this.state = 'DISCONNECTED';
    return this.emit('end');
  };

  return Connection;

})(events.EventEmitter);

Server = (function(_super) {

  __extends(Server, _super);

  function Server(opts) {
    var _this = this;
    this.opts = opts;
    this.server = net.createServer();
    this.server.on('connection', function(socket) {
      var connection;
      connection = new Connection(_this.opts);
      connection.listen(socket);
      return _this.emit('connection', connection);
    });
    this.server.on('error', function(error) {
      return _this.emit('error', error);
    });
  }

  Server.prototype.listen = function(port, cb) {
    if (port == null) {
      port = this.opts.port || 8000;
    }
    return this.server.listen(port, cb);
  };

  Server.prototype.close = function() {
    this.server.close();
    return this.server = null;
  };

  return Server;

})(events.EventEmitter);

exports.createServer = function(opts) {
  return new Server(opts);
};

exports.Server = Server;

exports.Connection = Connection;
