'use strict';

var _       = require('underscore');

// Represents a localized configuration
var Locale = function(options) {
  this.space = options.space;

  this.lang = options.lang;

  this.name = options.name;

  this.content = {};

  this.load_type = options.load_type;
};

// Retrieves the configuration node associated with a key
Locale.prototype.get = function(key) {
  if(this.load_type === 'dynamic'){
    return dynamicGet(this, key);
  } else {
    return staticGet(this, key);
  }
};

var staticGet = function(locale, key){
  var ptr = locale.content;
  if (typeof(key) === 'string') {
    var route = key.split('.');
    for (var prop in route) {
      if (typeof(ptr) === 'object')
        ptr = ptr[route[prop]];
      else
        return undefined;
    }
    return ptr;
  }
  return undefined;
};

var dynamicGet = function(locale, key){

};

module.exports = Locale;
