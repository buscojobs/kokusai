'use strict';

var locale = require('./locale');

module.exports.getLocale = locale.load;
module.exports.saveLocale = locale.save;

module.exports.express = function(req, res, next){
  req.getLocale = locale.load;
  req.saveLocale = locale.save;
  next();
};
