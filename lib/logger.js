var CRLF, LF, Logger, buffer, stream, utf8octets,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

stream = require('stream');

buffer = require('buffer');

utf8octets = require('./utf8octets');

LF = '\n';

CRLF = '\r\n';

Logger = (function(_super) {

  __extends(Logger, _super);

  function Logger(format, encoding, writer) {
    this.format = format != null ? format : '>';
    this.encoding = encoding != null ? encoding : 'utf8';
    this.writer = writer != null ? writer : console.log;
    this.writable = true;
  }

  Logger.prototype.log = function(data) {
    var format;
    if (typeof this.format !== 'function') {
      format = this.format;
    } else {
      format = this.format();
    }
    return this.writer(format, data);
  };

  Logger.prototype.write = function(chunk, encoding) {
    var line, utf8length, _i, _j, _len, _len1, _ref, _ref1;
    if (typeof chunk === 'string') {
      _ref = chunk.split(LF);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        this.log(line);
      }
    } else if (this.encoding === 'utf8') {
      utf8length = utf8octets(chunk);
      if (utf8length) {
        _ref1 = chunk.toString('utf8', 0, utf8length).split(LF);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          line = _ref1[_j];
          this.log(line);
        }
      }
      this.log(chunk.slice(utf8length));
    } else {
      this.log(chunk);
    }
    return this.emit('data', chunk);
  };

  Logger.prototype.end = function() {
    this.log('[end]');
    return this.emit('end');
  };

  return Logger;

})(stream.Stream);

module.exports = function(format, encoding, writer) {
  return new Logger(format, encoding, writer);
};
