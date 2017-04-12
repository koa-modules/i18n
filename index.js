'use strict'

/*!
 * i18n
 * Copyright(c) 2015 Fangdun Cai and Other Contributors
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

const debug = require('debug')('koa:i18n')
const I18n2 = require('i18n-2')

const LOCALE_METHODS = [
  'Subdomain',
  'Cookie',
  'Header',
  'Query',
  'Url',
  'TLD'
]
const SET_PREFIX = 'setLocaleFrom'
const GET_PREFIX = 'getLocaleFrom'

/**
 * Hacked i18n.
 */

class I18n extends I18n2 {

  constructor(opts) {
    super(opts)
    const modes = opts.modes || []
    const whitelist = this.whitelist = []
    modes.forEach(v => {
      if(typeof v !== 'function') {
        v = LOCALE_METHODS.filter(
          (t) => t.toLowerCase() === v.toLowerCase()
        )[0]
      }
      if (v) whitelist.push(v)
    })
  }

}

LOCALE_METHODS.forEach((m) => {
  Object.defineProperty(I18n.prototype, SET_PREFIX + m, {
    value: function () {
      let locale = getLocale(this.request[GET_PREFIX + m]())
      if (locale === this.getLocale()) return true
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

      const i18n = new I18n(opts)
      i18n.request = this.request
      this._i18n = i18n

      // merge into ctx.state
      this.state.i18n = i18n
      registerMethods(this.state, i18n)

      debug('app.ctx.i18n %j', i18n)
      return i18n
    }
  })

  Object.defineProperty(app.request, 'i18n', {
    get: function () {
      return this.ctx.i18n
    }
  })

  return function i18nMiddleware(ctx, next) {
    ctx.i18n.whitelist.some(key => {
      const customLocaleMethod = typeof key === 'function'
        && ctx.i18n.setLocale(key.apply(ctx))
      if (customLocaleMethod || ctx.i18n[SET_PREFIX + key]()) return true
    })
    return next()
  }
}

/**
 * Register methods
 */

function registerMethods(helpers, i18n) {
  I18n.resMethods.forEach(method => {
    helpers[method] = i18n[method].bind(i18n)
  })
}

function getLocale(locale) {
  return (locale || '').toLowerCase()
}

function filter(locale, locales) {
  for (const k in locales) {
    if (locale === k.toLowerCase()) {
      return k
    }
  }
}
