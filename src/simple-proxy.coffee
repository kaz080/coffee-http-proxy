colors = require 'colors'
optimist = require 'optimist'
argv = optimist
  .usage('Usage: node simple-proxy [options]')
  .default({
    'proxy': process.env.HTTP_PROXY,
    'port': 8180,
    'verbose': false,
    'help': false
  })
  .argv

if argv.help
  optimist.showHelp()
  process.exit 1

proxy = require '../lib/proxy'
logger = require '../lib/logger'

server = proxy.createServer argv

server.on 'connection', (connection) ->
  address = connection.client.remoteAddress
  port = connection.client.remotePort
  console.log "#{connection.id} Connection from #{address}:#{port}".green
  connection.on 'error', (error, received) ->
    console.log "#{connection.id} (#{address}:#{port}) #{error.toString()}".red
    console.log "#{connection.id}".red, received
  connection.on 'requested', (connection) ->
    dest = connection.dest
    id = connection.id
    method = connection.method
    console.log "#{id} #{method} #{dest.host}".cyan
    # You can modify proxy behavior, for example,
    #if dest.hostname.match /google\.com$/
    #  connection.bad_gateway "No route"
    #  connection.dest = other_destination
    #  connection.proxy = null
    if argv.verbose
      encoding = if method == 'CONNECT' then 'binary' else 'utf8'
      connection.log_sc = logger (id + '<').green, encoding
      connection.log_cs = logger (id + '>').yellow, encoding
    connection.once 'connected', (connection) ->
      text = "#{id} Connected"
      proxy = connection.proxy
      text += " via proxy #{proxy.hostname}:#{proxy.port}" if proxy
      console.log text.cyan
    connection.once 'end', ->
      console.log "#{id} [end]".yellow

server.listen argv.port, ->
  console.log 'Listening on port', argv.port

# Handle errors.
server.on 'error', (error) ->
  console.log error.toString().yellow
  process.exit 1

# Handle exceptions.
process.on 'uncaughtException', (error) ->
  console.error 'UncaughtException'.red
  console.error (error.stack || error.toString()).red
  process.exit 1
