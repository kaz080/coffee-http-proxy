chai = require 'chai'
expect = chai.expect
chai.should()

cp = require('child_process')
spawn = cp.spawn
exec = cp.exec
buffer = require 'buffer'
request = require('request')
  .defaults({'proxy': 'http://localhost:8888'})

test_data = '# Hello world!\r\n'
https_url = 'https://dl.dropbox.com/u/72827878/test.md'
http_url = 'http://dl.dropbox.com/u/72827878/test.md'

describe 'Proxy', ->
  proxy = null

  before (done) ->
    proxy = spawn 'coffee', ['main', '--port', 8888]
    proxy.on 'exit', ->
      #console.log 'Exit proxy'
    out = proxy.stdout
    out.setEncoding 'utf8'
    out.once 'data', (chunk) ->
      #console.log chunk
      #console.log typeof listener
      chunk.should.be.a 'string'
      if 0 != chunk.indexOf 'Listening'
        console.log chunk
        proxy.kill 'SIGTERM'
      chunk.indexOf('Listening').should.eql 0
      done()

  after (done) ->

    #console.log 'after'
    proxy.kill 'SIGTERM'
    done()

  describe 'HTTP proxy', ->

    beforeEach ->

    it "should get test data", (done) ->
      request http_url, (error, response, body) ->
        expect(error).to.equal(null)
        response.statusCode.should.eql 200
        body.should.eql test_data
        done()

  describe 'HTTPS proxy', ->

    beforeEach ->

    it "should get test data", (done) ->
      request https_url, (error, response, body) ->
        expect(error).to.equal(null)
        response.statusCode.should.eql 200
        body.should.eql test_data
        done()
