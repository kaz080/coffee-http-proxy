var MAP, buffer, createUTF8TypeMap, utf8octets;

buffer = require('buffer');

createUTF8TypeMap = function() {
  var TYPE, i, map, t, _i;
  TYPE = [[0x00, 1], [0x80, 'ext'], [0xC0, 'never'], [0xC2, 2], [0xE0, 3], [0xF0, 4], [0xF8, 5], [0xFC, 6], [0xFE, 'bom']];
  map = [];
  t = TYPE.length - 1;
  for (i = _i = 255; _i >= 0; i = --_i) {
    if (i < TYPE[t][0]) {
      t--;
    }
    map[i] = TYPE[t][1];
  }
  return map;
};

MAP = createUTF8TypeMap();

module.exports = utf8octets = function(chunk) {
  var ext, i, length, n, offset, type, _i;
  length = chunk.length;
  if (!buffer.Buffer.isBuffer(chunk)) {
    return true;
  }
  offset = 0;
  while (offset < length) {
    n = type = MAP[chunk[offset]];
    if (n === 1) {
      offset++;
      continue;
    }
    if (typeof type !== 'number') {
      return offset;
    }
    if (offset + n > length) {
      return offset;
    }
    for (i = _i = 1; 1 <= n ? _i < n : _i > n; i = 1 <= n ? ++_i : --_i) {
      ext = MAP[chunk[offset + i]];
      if (ext !== 'ext') {
        return offset;
      }
    }
    offset += n;
  }
  return length;
};
