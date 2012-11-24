chai = require 'chai'
expect = chai.expect
chai.should()

hms = require '../lib/hms'

describe '#hms()', ->

  it "should be string", ->
    result = hms()
    result.should.be.a 'string'
    result.should.match /^\d{2}:\d{2}:\d{2}.\d{3}$/
