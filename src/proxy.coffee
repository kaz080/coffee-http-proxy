stream = require 'stream'
buffer = require 'buffer'

before = (timeout, reason, cb) ->
  if timeout && cb
    reason ?= 'Timeout'
    error = new Error "#{reason} (#{timeout}ms)"
    setTimeout ->
      cb? error, null
      cb = null
    , timeout if timeout
  return (error, result) ->
    cb? error, result
    cb = null

pipeline = (streams) ->
  p = streams.shift()
  for stream in streams
    p = p.pipe stream if stream
  p

wait_for = (token, stream, timeout, cb) ->
  chunks = []
  text = ''
  done = before timeout, 'Token timeout', cb
  stream.on 'data', listener = (chunk) ->
    chunks.push chunk
    text += chunk.toString()
    found = text.indexOf token
    if found > -1
      stream.removeListener 'data', listener
      done null, buffer.Buffer.concat chunks

url = require 'url'
net = require 'net'
events = require 'events'

CRLF = '\r\n'
BREAK = CRLF + CRLF
CONNECT_OK = 'HTTP/1.1 200 Connection Established' + BREAK
CONNECT_BAD_GATEWAY = 'HTTP/1.1 502 Bad Gateway' + BREAK

parseHTTPHeader = (chunk) ->
  header = chunk.toString()
  lines = header.split CRLF
  req = lines[0].split ' '
  req_url = req[1]
  req_url = 'https://' + req_url if req[0] == 'CONNECT'
  return [req[0], url.parse req_url, req[2], lines[1..]]

class Connection extends events.EventEmitter
  next_id = 0
  constructor: (@opts) ->
    @id = "[#{next_id++}]"
    @state = 'INITIAL'
    @client = @remote = null
    @proxy = @opts?.proxy || null
    @log_cs = @opts?.log_cs || null
    @log_sc = @opts?.log_sc || null
  listen: (socket) ->
    @client = socket
    wait_for BREAK, socket, 1000, (error, @received) =>
      try
        throw error if error
        [@method, @dest, @httpVersion, @headers] = parseHTTPHeader @received
      catch error
        @emit 'error', error
        @end()
        return
      @dest.port ?= {'http:': 80, 'https:': 443}[@dest.protocol]
      @state = 'REQUESTED'
      @emit 'requested', @
  connect: ->
    return if @state != 'REQUESTED'
    if @proxy
      if typeof @proxy == 'string'
        @proxy = url.parse 'http://' + @proxy
      @proxy.port ?= 80
    remote = @proxy || @dest
    @remote = net.connect remote.port, remote.hostname, =>
      pipeline [@remote, @log_sc, @client, @log_cs, @remote]
      if @method == 'CONNECT' && !@proxy
        @client.write CONNECT_OK
      else
        @remote.write @received
      @state = 'CONNECTED'
      @emit 'connected', @
    @remote.once 'error', (error) =>
      @emit 'error', error
      @client.write CONNECT_BAD_GATEWAY
      @client.write '<h1>502 Bad Gateway</h1>' + CRLF
      @client.write error.toString() + CRLF
      @end()
  end: ->
    @destination?.end()
    @client?.end()
    @destination = @client = null
    @state = 'DISCONNECTED'
    @emit 'end'

class Server extends events.EventEmitter
  constructor: (@opts) ->
    @server = net.createServer()
    @server.on 'connection', (socket) =>
      connection = new Connection @opts
      connection.listen socket
      connection.once 'requested', =>
        @emit 'connection', connection
        connection.connect()
    @server.on 'error', (error) => @emit 'error', error
  listen: (port, cb) ->
    port ?= @opts.port || 8000
    @server.listen port, cb
  close: ->
    @server.close()
    @server = null

exports.createServer = (opts) -> new Server(opts)
exports.Server = Server
exports.Connection = Connection
