'use strict';

/**
 *  Module dependencies.
 */

var debug = require('debug')('koa:i18n');
var locale = require('koa-locale');
var I18n = require('i18n-2');

/**
 *  Expose
 */

module.exports = function (app, opts) {

  locale(app);

  /**
   *  Lazily creates an i18n.
   *
   *  @api public
   */

  app.context.__defineGetter__('i18n', function () {
    if (this._i18n) {
      return this._i18n;
    }

    var i18n = this._i18n = new I18n(opts), request = this.request;

    [
      'Query',
      'Subdomain',
      'Cookie',
      'Header'
    ].forEach(function (m) {
      i18n['setLocaleFrom' + m] = function () {
        var locale = getLocale(request['getLocaleFrom' + m]());
        if (locale && !i18n.locales[locale]) {
          locale = locale.split('-')[0];
          if (!i18n.locales[locale]) {
            locale = null;
          }
        }
        if (locale) {
          i18n.setLocale(locale);
          debug("Overriding locale from %s : %s", m.toLowerCase(), locale);
        }
      };
    });

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
    //this.i18n.setLocaleFromHeader();
    this.i18n.setLocaleFromQuery();
    yield *next;
  };
};

/**
 *  register methods
 */

function registerMethods(helpers, i18n) {
  I18n.resMethods.forEach(function (method) {
    helpers[method] = i18n[method].bind(i18n);
  });
  return helpers;
}

function getLocale(locale) {
  return (locale || '').toLowerCase();
};
