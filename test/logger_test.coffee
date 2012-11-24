chai = require 'chai'
chai.should()
expect = chai.expect
sinon = require 'sinon'
sinonChai = require 'sinon-chai'
chai.use sinonChai

logger = require '../lib/logger'
buffer = require 'buffer'
request = require 'request'

describe 'Logger', ->
  log = null
  listener = null
  writer = null

  it "should be initialized", ->
    log = logger()
    log.should.be.a 'object'
    log.should.have.property 'format', '>'
    log.should.have.property 'encoding', 'utf8'
    log.should.have.property 'writer', console.log

  describe '#write()', ->

    beforeEach ->
      listener = sinon.spy()
      writer = sinon.spy()
      log = logger '>', 'utf8', writer
      log.on 'data', listener

    it "should not write to console.log", ->
      log.should.have.property('writer').not.equal console.log

    it "should split binary into string and buffer", ->
      log.write new Buffer [0x61, 0x62, 0x63, 0xD0, 0x41, 0x42]
      log.end()
      listener.should.have.been.calledOn log
      listener.getCall(0).args[0].should.be.a 'object'
      writer.getCall(0).args[0].should.eql '>'
      writer.getCall(0).args[1].should.be.a('string').eql 'abc'
      writer.getCall(1).args[0].should.eql '>'
      writer.getCall(1).args[1].should.instanceOf(buffer.Buffer).with.length(3)

    it "should write string", ->
      log.write 'test'
      log.end()
      listener.should.have.been.calledOn log
      writer.should.have.been.calledWith '>', 'test'
