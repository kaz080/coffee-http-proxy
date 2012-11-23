chai = require 'chai'
expect = chai.expect
chai.should()

utf8octets = require '../lib/utf8octets'
buffer = require 'buffer'

describe 'utf8octets()', ->

  it "should be 2", ->
    chunk = new buffer.Buffer [0x0D, 0x0A]
    length = utf8octets chunk
    length.should.eql 2

  it "should be 0 for non utf8 buffer", ->
    result = utf8octets new buffer.Buffer [0xD0, 0x00, 0x41]
    result.should.eql 0
    result = utf8octets new buffer.Buffer [0xFE, 0xFF, 0x41]
    result.should.eql 0
    result = utf8octets new buffer.Buffer [0xC0, 0x00, 0x41]
    result.should.eql 0
    result = utf8octets new buffer.Buffer [0x80, 0x41]
    result.should.eql 0

  it "should be length of utf8 buffer", ->
    chunk = new buffer.Buffer [0xFC, 0x80, 0x80, 0x80, 0x80, 0x80]
    result = utf8octets chunk
    result.should.eql chunk.length

  it "should be only length of utf8 slice", ->
    chunk = new buffer.Buffer [0xFC, 0x80, 0x80, 0x80, 0x80, 0x80, 0xFC]
    result = utf8octets chunk
    result.should.eql 6

  it "should handle large binary", ->
    chunk = new buffer.Buffer 1 * 1024 * 1024
    chunk.fill 0x61
    result = utf8octets chunk
    result.should.eql chunk.length
