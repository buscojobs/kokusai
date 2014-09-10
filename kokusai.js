'use strict';

var Cache = require('./cache'),
    Locale = require('./locale'),
    path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    Promise = require('promise');

_.defaults = require('merge-defaults');

var Kokusai = function(options){
  this.cache = new Cache();
};

/* Loads a localized configuration file
  @param name: The configuration file name
  @param options.base_path: Base path for localization files (default: 'locales')
  @param options.space: The space name or country code
  @param options.lang: The language code
  @param options.load_type: The loading type, either 'dynamic' or 'static' (default: 'static')
*/
Kokusai.prototype.load = function(name, options) {
  var self = this;
  options = options || {};
  options.base_path = options.base_path || 'locales';
  options.space = options.space || 'default';
  options.load_type = options.load_type || 'static';

  var space = options.space
    , lang = options.lang;
  options.name = name;

  if(!lang){
    lang = loadDefaultLang(space, options);
  }

  // First we look for a proper cached configuration
  return self.cache.getLocale(options)
  .then(function(cached){
    if(cached){ // If found we return it
      return cached;
    } else {    // Otherwise we load it from the configuration files
      // Load the most specific configuration
      return mergeConfig({}, space, lang, options)
      .then(function(config){
        // Then merge it with the space configuration
        return mergeConfig(config, space, null, options);
      })
      .then(function(config){
        // Then merge it with the language configuration
        return mergeConfig(config, 'default', lang, options);
      })
      .then(function(config){
        // Finally merge it with the default configuration
        return mergeConfig(config, 'default', null, options);
      })
      .then(function(config){
        var locale = new Locale(options);
        locale.content = config;
        self.cache.saveLocale(options, locale);
        return Promise.resolve(locale);
      });
    }
  });
};

Kokusai.prototype.express = function(req, res, next){
  req.getLocale = this.load;
  next();
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
  return new Promise(function(fulfill, reject){
    loadContent(space, lang, options)
    .then(function(loaded){
      config = _.defaults(config, loaded);
      fulfill(config);
    });
  });
};

// Loads a configuration file
var loadContent = function(space, lang, options) {
  var parts = [ options.base_path ];

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
        fs.readFile(config_path, function(err, data){
          if(err){
            fulfill({}, options);
          } else {
            try {
              fulfill(JSON.parse(data), options);
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

module.exports = Kokusai;
