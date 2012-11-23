stream = require 'stream'
buffer = require 'buffer'

createUTF8TypeMap = ->
  TYPE = [ [0x00, 1], [0x80, 'ext'], [0xC0, 'never'], [0xC2, 2],
    [0xE0, 3], [0xF0, 4], [0xF8, 5], [0xFC, 6], [0xFE, 'bom'] ]
  map = []
  t = TYPE.length - 1
  for i in [255..0]
    t-- if i < TYPE[t][0]
    map[i] = TYPE[t][1]
  return map

MAP = createUTF8TypeMap()

# Count valid utf8 octets from head of buffer
# @return octet length
module.exports = utf8octets = (chunk) ->
  length = chunk.length
  return true unless buffer.Buffer.isBuffer chunk
  offset = 0
  # TODO: Skip BOM?
  while offset < length
    n = type = MAP[chunk[offset]]
    #console.log 'type', chunk[offset], type
    if n == 1
      offset++
      continue
    return offset if typeof type != 'number'
    return offset if offset + n > length
    for i in [1...n]
      ext = MAP[chunk[offset + i]]
      #console.log 'ext', chunk[offset + i], ext
      return offset if ext != 'ext'
    offset += n
  return length
