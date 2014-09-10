'use strict';

var Promise = require('promise');

var Cache = function(){
  this.local = {}; // Local cache
};

Cache.prototype.getLocale = function(options){
  var key = [options.space, options.lang, options.name],
      found = this.local[key];
  if(found){
    return Promise.resolve(found);
  } else if(options.load_type === 'dynamic'){
    // Find in redis
  } else {
    return Promise.resolve();
  }
};

Cache.prototype.saveLocale = function(options, locale){
  var key = [options.space, options.lang, options.name];
  this.local[key] = locale;
};

module.exports = Cache;
