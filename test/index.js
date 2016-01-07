'use strict'

/**
 * Module dependencies.
 */

const assert = require('assert')
const path = require('path')
const request = require('supertest')
const Koa = require('koa')
const convert = require('koa-convert')
const compose = require('koa-compose')
const locale = require('koa-locale')
const render = require('koa-swig')
const views = require('koa-views')
const i18n = require('..')

describe('koa-i18n', () => {

  describe('Detect the Querystring', () => {
    it('should be `en` locale', () => {
      var app = new Koa()

      locale(app)

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en'],
        modes: ['query']
      }))

      app.use(convert(function*(next) {
        this.body = this.i18n.__('locales.en')
      }))

      return request(app.listen())
      .get('/?locale=en')
      .expect(/english/i)
      .expect(200)
    })

  })

  describe('Detect the Subdomain', () => {
    var app = new Koa()
    var currentLocale

    locale(app)

    var enApp = new Koa()
    enApp.use(convert(function*() {
      currentLocale = this.getLocaleFromSubdomain()
    }))
    enApp = compose(enApp.middleware)

    var zhCNApp = new Koa()
    zhCNApp.use(convert(function*() {
      currentLocale = this.getLocaleFromSubdomain()
    }))
    zhCNApp = compose(zhCNApp.middleware)

    app.use(convert(function*(next) {
      currentLocale = undefined
      switch (this.host) {
        case 'en.koajs.com':
          yield enApp.call(this, this)
        case 'zh-CN.koajs.com':
          yield zhCNApp.call(this, this)
      }
      yield next
    }))

    app.use(i18n(app, {
      directory: __dirname + '/fixtures/locales',
      locales: ['zh-CN', 'en', 'zh-tw'],
      modes: ['subdomain']
    }))

    app.use(convert(function*(next) {
      if (currentLocale) {
        assert(currentLocale === this.getLocaleFromSubdomain())
      }
      this.body = this.i18n.__('locales.en')
    }))

    it('should be `en` locale', () => {
      return request(app.listen())
      .get('/')
      .set('Host', 'en.koajs.com')
      .expect(/English/)
      .expect(200)
    })

    it('should be `zh-cn` locale', () => {
      return request(app.listen())
      .get('/')
      .set('Host', 'zh-CN.koajs.com')
      .expect(/英文/)
      .expect(200)
    })

    it('should be `zh-tw` locale', () => {
      return request(app.listen())
      .get('/')
      .set('Host', 'zh-TW.koajs.com')
      .expect(/locales.en/)
      .expect(200)
    })

  })

  describe('Dected the header', () => {
    it('should be `zh-tw` locale', () => {
      var app = new Koa()

      locale(app)

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        modes: ['header']
      }))

      app.use(convert(function*(next) {
        this.body = this.i18n.__('locales.zh-CN')
      }))

      return request(app.listen())
      .get('/')
      .set('Accept-Language', 'zh-TW')
      .expect(/簡體中文/)
      .expect(200)
    })
  })

  describe('Detect the cookie', () => {
    it('should be `zh-cn` locale', () => {
      var app = new Koa()

      locale(app)

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        modes: ['cookie']
      }))

      app.use(convert(function*(next) {
        this.body = this.i18n.__('locales.zh-CN')
      }))

      return request(app.listen())
      .get('/')
      .set('Cookie', 'locale=zh-cn')
      .expect(/简体中文/)
      .expect(200)
    })
  })

  describe('working together, i18n and swig-render', () => {
    it('should be render by zh-cn locale', () => {
      var app = new Koa()

      locale(app)

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        modes: ['cookie']
      }))

      app.context.render = render({
        root: __dirname + '/fixtures/',
        ext: 'html'
      })

      app.use(convert(function*(next) {
        yield this.render('index')
      }))

      return request(app.listen())
      .get('/')
      .set('Cookie', 'locale=zh-cn')
      .expect(/英文/)
      .expect(200)
    })
  })

  describe('working together with koa-views, jade render', () => {
    it('should be render by zh-cn locale', () => {
      var app = new Koa()

      locale(app, 'lang')

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        modes: ['cookie']
      }))

      app.use(convert(views(__dirname + '/fixtures/', {
        default: 'jade'
      })))

      app.use(convert(function*(next) {
        yield this.render('index')
      }))

      return request(app.listen())
      .get('/')
      .set('Cookie', 'lang=zh-cn')
      .expect(/<div><p>英文<\/p><\/div>/)
      .expect(200)
    })
  })

  describe('Dected the header and cookie', () => {
    var app
    before(() => {
      app = new Koa()

      locale(app)

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        modes: ['cookie', 'header']
      }))

      app.use(convert(function*(next) {
        this.body = this.i18n.__('locales.zh-CN')
      }))
    })

    it('should be `zh-tw` locale', () => {
      return request(app.listen())
      .get('/')
      .set('Accept-Language', 'zh-TW')
      .expect(/簡體中文/)
      .expect(200)
    })

    it('should be `zh-cn` locale', () => {
      return request(app.listen())
      .get('/')
      .set('Cookie', 'locale=zh-cn')
      .set('Accept-Language', 'en')
      .expect(/简体中文/)
      .expect(200)
    })
  })

  describe('accepts custom function as a mode', () => {
    var app,
    customMode = function() {
      return this.state.defaultLocale
    }

    before(() => {
      app = new Koa()

      locale(app)

      app.use(convert(function* dummyMiddleware(next) {
        this.state.defaultLocale = 'en'
        yield next
      }))

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        modes: ['cookie', customMode]
      }))

      app.use(convert(function*(next) {
        this.body = this.i18n.__('locales.zh-CN')
      }))
    })

    it('should be `en` locale', () => {
      return request(app.listen())
      .get('/')
      .expect(/Chinese\(Simplified\)/)
      .expect(200)
    })

    it('should be `zh-cn` locale', () => {
      return request(app.listen())
      .get('/')
      .set('Cookie', 'locale=zh-cn')
      .expect(/简体中文/)
      .expect(200)
    })
  })

  describe('ctx.state has i18n property', () => {
    it('should be `en` locale', () => {
      var app = new Koa()

      locale(app)

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en'],
        modes: ['query']
      }))

      app.use(convert(function*(next) {
        assert(this.state.i18n === this.i18n)
        assert.deepEqual(Object.keys(this.state.i18n.locales), ['zh-CN', 'en'])
        this.body = this.i18n.__('locales.en')
      }))

      return request(app.listen())
      .get('/?locale=en')
      .expect(/english/i)
      .expect(200)
    })
  })

  describe('app.request has i18n property', () => {
    it('should be `en` locale', () => {
      var app = new Koa()

      locale(app)

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en'],
        modes: ['query']
      }))

      app.use(convert(function*(next) {
        this.body = !!this.request.i18n
      }))

      return request(app.listen())
      .get('/?locale=en')
      .expect(/true/)
      .expect(200)
    })
  })
})
