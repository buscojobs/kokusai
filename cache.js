'use strict';

var Cache = function(){
  this.content = {};
};

Cache.prototype.getLocale = function(options){
  var key = [options.space, options.lang, options.name];
  return this.content[key];
};

Cache.prototype.saveLocale = function(options, locale){
  var key = [options.space, options.lang, options.name];
  this.content[key] = locale;
};

module.exports = Cache;
