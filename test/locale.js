'use strict';

var expect  = require('chai').expect,
    kokusai = require('../'),
    path    = 'test/locales';

describe('Locales', function(){

  describe('# specific country / specific language', function(){

    var en   = null,
        es   = null;

    before(function(done){
      kokusai.getLocale('resource', { space: 'US', lang: 'en', base_path: path })
      .then(function(locale){
        en = locale;
        return kokusai.getLocale('resource', { space: 'US', lang: 'es', base_path: path });
      })
      .then(function(locale){
        es = locale;
        done();
      });
    });

    it('should load the most specific configurations', function(){
      expect(en.get('lang')).to.be.equal('English');
      expect(es.get('lang')).to.be.equal('Español');
      expect(en.get('region')).to.be.equal('North America');
    });

    it('should fallback and load the space specific configuration', function(){
      expect(en.get('country')).to.be.equal('United States of America');
    });

    it('should fallback and load the language specific configuration', function(){
      expect(en.get('key1')).to.be.equal('default value 1');
      expect(en.get('key2')).to.be.equal('default value 2');
    });

    it('should fallback and load the default configuration', function(){
      expect(en.get('commonKey')).to.be.equal('commonValue');
    });

    it('should load nested configurations', function(){
      expect(en.get('state.Texas.capital')).to.be.equal('Austin');
      expect(es.get('currency.code')).to.be.equal('USD');
      expect(es.get('currency.name')).to.be.equal('Dolar americano');
    });

    it('should not load a nonexistent configuration', function(){
      expect(en.get('nonExistentKey')).to.be.equal(undefined);
      expect(en.get('lang.name')).to.be.equal(undefined);
      expect(en.get('key1.key2.key3')).to.be.equal(undefined);
    });

  });

  describe('# specific country / default language', function(){
    var locale   = null;

    before(function(done){
      kokusai.getLocale('resource', { space: 'US', base_path: path })
      .then(function(loaded){
        locale = loaded;
        done();
      });
    });

    it('should load a space specific configuration', function(){
      expect(locale.get('capital')).to.be.equal('Washington D.C.');
      expect(locale.get('currency.code')).to.be.equal('USD');
    });

    it('should load a default configuration', function(){
      expect(locale.get('commonKey')).to.be.equal('commonValue');
    });

    it('should load the default language configuration', function(){
      expect(locale.get('lang')).to.be.equal('English');
      expect(locale.get('messages.welcome')).to.be.equal('Welcome home!');
    });

    it('should not load a language default configuration', function(){
      expect(locale.get('key1')).to.be.equal('default value 1');
      expect(locale.get('key2')).to.be.equal('default value 2');
    });
  });

  describe('# default country / specific language', function(){
    var locale   = null;

    before(function(done){
      kokusai.getLocale('resource', { lang: 'en', base_path: path })
      .then(function(loaded){
        locale = loaded;
        done();
      });
    });

    it('should not load a space specific configuration', function(){
      expect(locale.get('capital')).to.be.equal(undefined);
      expect(locale.get('currency.code')).to.be.equal(undefined);
    });

    it('should load a default configuration', function(){
      expect(locale.get('commonKey')).to.be.equal('commonValue');
    });

    it('should not load a language specific configuration', function(){
      expect(locale.get('lang')).to.be.equal(undefined);
      expect(locale.get('messages.welcome')).to.be.equal(undefined);
    });

    it('should load a language default configuration', function(){
      expect(locale.get('key1')).to.be.equal('default value 1');
      expect(locale.get('key2')).to.be.equal('default value 2');
    });
  });

  describe('# default country / default language', function(){
    var locale   = null;

    before(function(done){
      kokusai.getLocale('resource', { base_path: path })
      .then(function(loaded){
        locale = loaded;
        done();
      });
    });

    it('should load default configurations', function(){
      expect(locale.get('commonKey')).to.be.equal('commonValue');
    });

    it('should not load any other configuration', function(){
      expect(locale.get('lang')).to.be.equal(undefined);
      expect(locale.get('message.welcome')).to.be.equal(undefined);
      expect(locale.get('key1')).to.be.equal(undefined);
      expect(locale.get('capital')).to.be.equal(undefined);
      expect(locale.get('state.Texas')).to.be.equal(undefined);
      expect(locale.get('currency.code')).to.be.equal(undefined);
    });
  });

  describe('# non-existent resource file', function(){
    var locale   = null;

    before(function(done){
      kokusai.getLocale('nofile')
      .then(function(loaded){
        locale = loaded;
        done();
      });
    });

    it('should not load any configuration', function(){
      expect(locale.get('commonKey')).to.be.equal(undefined);
      expect(locale.get('message.welcome')).to.be.equal(undefined);
      expect(locale.get('key1')).to.be.equal(undefined);
      expect(locale.get('currency.code')).to.be.equal(undefined);
    });
  });
});
