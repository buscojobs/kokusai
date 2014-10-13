'use strict';

var _ = require('underscore');

// Flattens the content of a config file, returning an object with dot separated keys
var _flatten = function(flattened, path, config){
  for(var key in config){
    var value = config[key];
    path.push(key);
    if(typeof value === 'object'){
      _.extend(flattened, _flatten(flattened, path, value));
    } else {
      var folder = path[0];
      if(path.length > 1){
        flattened[folder] = flattened[folder] || {};
        flattened[folder][path.slice(1).join('.')] = value;
      } else {
        flattened[folder] = value;
      }
    }
    path.pop();
  }
  return flattened;
};

var flatten = module.exports.flatten = function(config){
  var flattened = {};
  _flatten(flattened, [], config);
  return flattened;
};

module.exports.calculateDiff = function(locale, specific, _default){
  specific = flatten(specific);
  _default = flatten(_default);

  var pending = _.difference(Object.keys(_default), Object.keys(specific));
  var results = {};

  _.each(Object.keys(_default), function(key){
    var value = _default[key];
    if(typeof value === 'object'){
      value = _.map(Object.keys(value), function(path){
        return {
          id: path,
          translation: specific[key] && specific[key][path],
          default: value[path]
        };
      });

      results[key] = value;
    } else {
      results['@root'] = results['@root'] || [];
      results['@root'].push({
        id: key,
        translation: specific[key],
        default: _default[key]
      });
    }
  });

  return {
    total: Object.keys(_default).length,
    pending: pending.length,
    space: locale.space,
    lang: locale.lang,
    name: locale.name,

    results: results
  };
};
