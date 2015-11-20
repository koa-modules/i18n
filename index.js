/*!
 * i18n
 * Copyright(c) 2015 Fangdun Cai and Other Contributors
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

const debug = require('debug')('koa:i18n')
const i18n2 = require('i18n-2')

/**
 * Hacked i18n.
 */

function I18n(opts) {
  i18n2.call(this, opts)
  var enables = this.enables = []
  var modes = opts.modes || []
  modes.forEach(function (v) {
    if(typeof v !== 'function') {
      v = localeMethods.filter(function (t) {
        return t.toLowerCase() === v.toLowerCase()
      })[0]
    }
    if (v) {
      enables.push(v)
    }
  })
}


Object.setPrototypeOf(I18n, i18n2)
Object.setPrototypeOf(I18n.prototype, i18n2.prototype)

var localeMethods = [ 'Subdomain', 'Cookie', 'Header', 'Query', 'Url', 'TLD' ]
var SET_PREFIX = 'setLocaleFrom'
var GET_PREFIX = 'getLocaleFrom'
localeMethods.forEach(function (m) {
  Object.defineProperty(I18n.prototype, SET_PREFIX + m, {
    value: function () {
      var locale = getLocale(this.request[GET_PREFIX + m]())
      if (locale === this.getLocale().toLowerCase()) return true
      if ((locale = filter(locale, this.locales))) {
        this.setLocale(locale)
        debug('Overriding locale from %s : %s', m.toLowerCase(), locale)
        return true
      }
    }
  })
})

/**
 *  Expose ial.
 */

module.exports = ial

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
        return this._i18n
      }

      var i18n = this._i18n = new I18n(opts)
      i18n.request = this.request

      // merge into ctx.state
      registerMethods(this.state, this._i18n)

      debug('app.ctx.i18n %j', this._i18n)
      return this._i18n
    }
  });

  Object.defineProperty(app.request, 'i18n', {
    get: function () {
      return this.ctx.i18n
    }
  });

  return function *i18nMiddleware(next) {
    this.i18n.enables.some(function (key) {
      var customLocaleMethod = typeof key === 'function' && this.i18n.setLocale(key.apply(this));
      if (customLocaleMethod || this.i18n[SET_PREFIX + key]()) return true;
    }.bind(this));
    yield next
  }
}

/**
 * Register methods
 */

function registerMethods(helpers, i18n) {
  I18n.resMethods.forEach(function (method) {
    helpers[method] = function () {
      return i18n[method].apply(i18n, arguments)
    }
  })
  return helpers
}

function getLocale(locale) {
  return (locale || '').toLowerCase()
}

function filter(locale, locales) {
  for (var k in locales) {
    if (locale === k.toLowerCase()) {
      return k
    }
  }
  return null
}
