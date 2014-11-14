'use strict';

/**
 *  Module dependencies.
 */

var debug = require('debug')('koa:i18n');
var mixin = require('utils-merge');
var i18n2 = require('i18n-2');

/**
 *  Hacked i18n.
 */

function I18n(opts) {
  i18n2.call(this, opts);
  var enables = this.enables = Object.create(null);
  localeMethods.forEach(function (v) {
    if (opts[v.toLowerCase()]) enables[v] = true;
  });
}

mixin(I18n, i18n2);

I18n.prototype.__proto__ = i18n2.prototype;

var localeMethods = [ 'Query', 'Subdomain', 'Cookie', 'Header' ];
var SET_PREFIX = 'setLocaleFrom';
var GET_PREFIX = 'getLocaleFrom';
localeMethods.forEach(function (m) {
  I18n.prototype[SET_PREFIX + m] = function () {
    var locale = getLocale(this.request[GET_PREFIX + m]());
    if (locale === this.getLocale().toLowerCase()) return;
    if ((locale = filter(locale, this.locales))) {
      this.setLocale(locale);
      debug('Overriding locale from %s : %s', m.toLowerCase(), locale);
    }
  };
});

/**
 *  Expose
 */

module.exports = ial;


// Internationalization and Localization
function ial(app, opts) {

  /**
   *  Lazily creates an i18n.
   *
   *  @api public
   */

  app.context.__defineGetter__('i18n', function () {
    if (this._i18n) {
      return this._i18n;
    }

    var i18n = this._i18n = new I18n(opts);
    i18n.request = this.request;

    // merge into ctx.locals
    if (this.locals) {
      registerMethods(this.locals, this._i18n);
    }

    debug('app.ctx.i18n %j', this._i18n);
    return this._i18n;
  });

  app.request.__defineGetter__('i18n', function () {
    return this.ctx.i18n;
  });

  return function *i18n(next) {
    var i18n = this.i18n;
    var enables = i18n.enables;
    for (var key in enables) {
      i18n[SET_PREFIX + key]();
    }
    yield *next;
  };
}

/**
 *  register methods
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
