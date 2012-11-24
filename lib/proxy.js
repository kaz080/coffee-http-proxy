var BREAK, CONNECT_BAD_GATEWAY, CONNECT_OK, CRLF, Connection, Server, before, buffer, events, net, parseHTTPHeader, pipeline, stream, url, wait_for,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

stream = require('stream');

buffer = require('buffer');

before = function(timeout, reason, cb) {
  var error;
  if (timeout && cb) {
    if (reason == null) {
      reason = 'Timeout';
    }
    error = new Error("" + reason + " (" + timeout + "ms)");
    if (timeout) {
      setTimeout(function() {
        if (typeof cb === "function") {
          cb(error, null);
        }
        return cb = null;
      }, timeout);
    }
  }
  return function(error, result) {
    if (typeof cb === "function") {
      cb(error, result);
    }
    return cb = null;
  };
};

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
  var chunks, done, listener, text;
  chunks = [];
  text = '';
  done = before(timeout, 'Token timeout', cb);
  return stream.on('data', listener = function(chunk) {
    var found;
    chunks.push(chunk);
    text += chunk.toString();
    found = text.indexOf(token);
    if (found > -1) {
      stream.removeListener('data', listener);
      return done(null, buffer.Buffer.concat(chunks));
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
  var header, lines, req, req_url;
  header = chunk.toString();
  lines = header.split(CRLF);
  req = lines[0].split(' ');
  req_url = req[1];
  if (req[0] === 'CONNECT') {
    req_url = 'https://' + req_url;
  }
  return [req[0], url.parse(req_url, req[2], lines.slice(1))];
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
    return wait_for(BREAK, socket, 1000, function(error, received) {
      var _base, _ref, _ref1;
      _this.received = received;
      try {
        if (error) {
          throw error;
        }
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
      return _this.emit('requested', _this);
    });
  };

  Connection.prototype.connect = function() {
    var remote, _base, _ref,
      _this = this;
    if (this.state !== 'REQUESTED') {
      return;
    }
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
      if (_this.method === 'CONNECT' && !_this.proxy) {
        _this.client.write(CONNECT_OK);
      } else {
        _this.remote.write(_this.received);
      }
      _this.state = 'CONNECTED';
      return _this.emit('connected', _this);
    });
    return this.remote.once('error', function(error) {
      _this.emit('error', error);
      _this.client.write(CONNECT_BAD_GATEWAY);
      _this.client.write('<h1>502 Bad Gateway</h1>' + CRLF);
      _this.client.write(error.toString() + CRLF);
      return _this.end();
    });
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
      return connection.once('requested', function() {
        _this.emit('connection', connection);
        return connection.connect();
      });
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
