pad = (n, l = 2) -> ('00' + n).substr -l
module.exports = (date) ->
  date ?= new Date()
  pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' +
    pad(date.getSeconds()) + '.' + pad(date.getMilliseconds(), 3)
