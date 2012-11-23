chai = require 'chai'
expect = chai.expect
chai.should()

proxy = require '../lib/proxy'

opts = port: 8888

describe 'proxy', ->
  server = null
  connection = null

  before ->
    server = proxy.createServer opts
    server.on 'connection', (conn) ->
      connection = conn
      done()

  describe 'Server', ->

    it 'should be instance of proxy.Server', ->
      expect(server).not.to.be.null
      server.should.be.instanceof proxy.Server
      server.should.have.property 'opts'

    describe '#Event connection', ->

  describe 'Connection', ->

    describe '#client', ->

    describe '#destination', ->
