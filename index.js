/*!
 * locale
 * Copyright(c) 2015 Fangdun Cai and Other Contributors
 * MIT Licensed
 */

/*jshint esnext:true */


/**
 * Module dependencies.
 */

var debug = require('debug')('koa:i18n');
var mixin = require('utils-merge');
var i18n2 = require('i18n-2');

/**
 * Hacked i18n.
 */

function I18n(opts) {
  i18n2.call(this, opts);
  var enables = this.enables = [];
  var modes = opts.modes || [];
  localeMethods.forEach(function (v) {
    var lv = v.toLowerCase();
    if (modes.filter(function (t) { return t.toLowerCase() === lv; }).length) {
      enables.push(v);
    }
  });
}

mixin(I18n, i18n2);

I18n.prototype = Object.create(i18n2.prototype);

var localeMethods = [ 'Subdomain', 'Cookie', 'Header', 'Query', 'Url', 'TLD' ];
var SET_PREFIX = 'setLocaleFrom';
var GET_PREFIX = 'getLocaleFrom';
localeMethods.forEach(function (m) {
  Object.defineProperty(I18n.prototype, SET_PREFIX + m, {
    value: function () {
      var locale = getLocale(this.request[GET_PREFIX + m]());
      if (locale === this.getLocale().toLowerCase()) return;
      if ((locale = filter(locale, this.locales))) {
        this.setLocale(locale);
        debug('Overriding locale from %s : %s', m.toLowerCase(), locale);
        return true;
      }
    }
  });
});

/**
 *  Expose ial.
 */

module.exports = ial;

// Internationalization and Localization
function ial(app, opts) {

  /**
   * Lazily creates an i18n.
   *
   * @api public
   */

  Object.defineProperty(app.context, 'i18n', {
    get: function () {
      if (this._i18n) {
        return this._i18n;
      }

      var i18n = this._i18n = new I18n(opts);
      i18n.request = this.request;

      // merge into ctx.state
      registerMethods(this.state, this._i18n);

      debug('app.ctx.i18n %j', this._i18n);
      return this._i18n;
    }
  });

  Object.defineProperty(app.request, 'i18n', {
    get: function () {
      return this.ctx.i18n;
    }
  });

  return function *i18nMiddleware(next) {
    var i18n = this.i18n;
    var enables = i18n.enables;
    enables.forEach(function (key) {
      if (i18n[SET_PREFIX + key]()) return false;
    });
    yield next;
  };
}

/**
 * Register methods
 */

function registerMethods(helpers, i18n) {
  I18n.resMethods.forEach(function (method) {
    helpers[method] = function () {
      return i18n[method].apply(i18n, arguments);
    };
  });
  return helpers;
}

function getLocale(locale) {
  return (locale || '').toLowerCase();
}

function filter(locale, locales) {
  for (var k in locales) {
    if (locale === k.toLowerCase()) {
      return k;
    }
  }
  return null;
}