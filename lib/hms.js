var pad;

pad = function(n, l) {
  if (l == null) {
    l = 2;
  }
  return ('00' + n).substr(-l);
};

module.exports = function(date) {
  if (date == null) {
    date = new Date();
  }
  return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds()) + '.' + pad(date.getMilliseconds(), 3);
};
