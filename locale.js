'use strict';

var path    = require('path'),
    fs      = require('fs'),
    Promise = require('promise'),
    _       = require('underscore'),
    Cache   = require('./cache'),
    JSON5   = require('json5');

_.defaults = require('merge-defaults');

var cache = new Cache();

// Represents a localized configuration
var Locale = function(options) {
  this.space = options.space;

  this.lang = options.lang;

  this.name = options.name;

  this.content = {};
};

// Retrieves the configuration node associated with a key
Locale.prototype.get = function(key) {
  var ptr = this.content;
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

// Loads a configuration file
var loadContent = function(space, lang, options) {
  var parts = [ options.base_path ];
  var encoding = options.encoding || 'utf8';

  if(typeof space === 'string')
    parts.push(space);

  if(typeof lang === 'string')
    parts.push(lang);

  parts.push(options.name);

  var config_path = path.join.apply(undefined, parts);
  if(config_path.substring(config_path.length - 5) !== '.json') {
      config_path += '.json';
  }

  return new Promise(function(fulfill, reject){
    fs.exists(config_path, function(exists){
      if(exists){
        fs.readFile(config_path, { encoding: encoding }, function(err, data){
          if(err){
            fulfill({}, options);
          } else {
            try {
              fulfill(JSON5.parse(data), options);
            } catch(err){
              err.message = 'Error parsing file "' + config_path + '"';
              throw err;
            }
          }
        });
      } else {
        fulfill({}, options);
      }
    });
  });
};

var saveContent = function(space, lang, options, data) {
  var content = loadContent(space, lang, options).then(function(content) {
    console.log(content);
  });
};

// Loads the default language from base_path/space/lang.config
var loadDefaultLang = function(space, options){
  var config_path = path.join(options.base_path, space, 'lang.config');
  var lang = null;
  if(fs.existsSync(config_path)){
    var content = fs.readFileSync(config_path, { encoding: 'utf8' });
    var match = content.match(/lang=(\w{2})/);
    if(Array.isArray(match)){
      lang = match[1];
    }
  }
  return lang;
};

// Merges a partial configuration with the content of another configuration file
var mergeConfig = function(config, space, lang, options) {
  return loadContent(space, lang, options)
  .then(function(loaded){
    return _.defaults(config, loaded);
  });
};

/* Loads a localized configuration file
  @param name: The configuration file name
  @param options.base_path: Base path for localization files (default: 'locales')
  @param options.space: The space name or country code
  @param options.lang: The language code
  @param options.encoding: The encoding of the resource files (default: 'utf8')
  @param options.mergeLevel: The merge depth to perform. 0=space and lang specific only |
    1=space specific, no lang | 2=default space, lang specific | 3=default space and lang (default: 3)
*/
module.exports.load = function(name, options) {
  options = options || {};
  _.defaults(options, { base_path: 'locales', space: 'default' });

  var space = options.space
    , lang = options.lang;
  options.name = name;

  // If we found a proper configuration cached, we return it
  var cached = cache.getLocale(options);
  if(cached){
    return Promise.resolve(cached);
  }

  if(!lang){
    lang = loadDefaultLang(space, options);
  }

  var depth = 0;

  var depthExceeded = function(){
    return ++depth > options.mergeLevel;
  };

  // Load the most specific configuration
  return mergeConfig({}, space, lang, options)
  .then(function(config){
    if(depthExceeded())
      return config;
    // Then merge it with the space configuration
    return mergeConfig(config, space, null, options);
  })
  .then(function(config){
    if(depthExceeded())
      return config;
    // Then merge it with the language configuration
    return mergeConfig(config, 'default', lang, options);
  })
  .then(function(config){
    if(depthExceeded())
      return config;
    // Finally merge it with the default configuration
    return mergeConfig(config, 'default', null, options);
  })
  .then(function(config){
    var locale = new Locale(options);
    locale.content = config;
    cache.saveLocale(options, locale);

    return Promise.resolve(locale);
  });
};
