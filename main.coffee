colors = require 'colors'
argv = require('optimist')
  .usage('Usage: coffee proxy')
  .default({
    'proxy': process.env.HTTP_PROXY,
    'port': 8180
  })
  .argv
proxy = require './lib/proxy'
logger = require './lib/logger'

server = proxy.createServer argv

server.on 'connection', (connection) ->
  address = connection.client.remoteAddress
  port = connection.client.remotePort
  dest = connection.dest
  id = connection.id
  console.log "#{id} Connection from #{address}:#{port} to #{dest.hostname}:#{dest.port}".yellow
  #connection.dest.host.match /google\.com/
  #connection.proxy = other_proxy
  #connection.bad_proxy "No route"
  if argv.verbose
    encoding = if connection.method == 'CONNECT' then 'binary' else 'utf8'
    connection.log_sc = logger (id + '<').green, encoding
    connection.log_cs = logger (id + '>').yellow, encoding
  connection.once 'connected', (connection) ->
    text = "#{id} Connected"
    proxy = connection.proxy
    text += " via proxy #{proxy.hostname}:#{proxy.port}" if proxy
    console.log text.green
  connection.on 'error', (error) ->
    console.log error.toText().red

server.listen argv.port, ->
  console.log 'Listening on port', argv.port

server.on 'error', (error) ->
  console.log error.toString().red

process.on 'uncaughtException', (error) ->
  console.error error.stack.red
  process.exit 1
