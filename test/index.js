'use strict'

/**
 * Module dependencies.
 */

const path = require('path')
const request = require('supertest')
const koa = require('koa')
const compose = require('koa-compose')
const locale = require('koa-locale')
const render = require('koa-swig')
const views = require('koa-views')
const i18n = require('..')

describe('koa-i18n', () => {

  describe('Detect the Querystring', () => {
    it('should be `en` locale', () => {
      var app = koa()

      locale(app)

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en'],
        modes: ['query']
      }))

      app.use(function*(next) {
        this.body = this.i18n.__("locales.en")
      })

      return request(app.listen())
        .get('/?locale=en')
        .expect(/english/i)
        .expect(200)
    })

  })

  describe('Detect the Subdomain', () => {
    var app = koa()

    locale(app)

    var enApp = koa()
    enApp.use(function*() {
      this.body = this.getLocaleFromSubdomain()
    })
    enApp = compose(enApp)

    var zhCNApp = koa()
    zhCNApp.use(function*() {
      this.body = this.getLocaleFromSubdomain()
    })
    zhCNApp = compose(zhCNApp)

    app.use(function*(next) {
      switch (this.host) {
        case 'en.koajs.com':
          return yield enApp.call(this, next)
        case 'zh-CN.koajs.com':
          return yield zhCNApp.call(this, next)
      }
      yield next
    })

    app.use(i18n(app, {
      directory: __dirname + '/fixtures/locales',
      locales: ['zh-CN', 'en', 'zh-tw'],
      modes: ['subdomain']
    }))

    app.use(function*(next) {
      this.body = this.i18n.__("locales.en")
    })

    it('should be `en` locale', () => {
      return request(app.listen())
        .get('/')
        .set('Host', 'eN.koajs.com')
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
      var app = koa()

      locale(app)

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        modes: ['header']
      }))

      app.use(function*(next) {
        this.body = this.i18n.__("locales.zh-CN")
      })

      return request(app.listen())
        .get('/')
        .set('Accept-Language', 'zh-TW')
        .expect(/簡體中文/)
        .expect(200)
    })
  })

  describe('Detect the cookie', () => {
    it('should be `zh-cn` locale', () => {
      var app = koa()

      locale(app)

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        modes: ['cookie']
      }))

      app.use(function*(next) {
        this.body = this.i18n.__("locales.zh-CN")
      })

      return request(app.listen())
        .get('/')
        .set('Cookie', 'locale=zh-cn')
        .expect(/简体中文/)
        .expect(200)
    })
  })

  describe('working together, i18n and swig-render', () => {
    it('should be render by zh-cn locale', () => {
      var app = koa()

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

      app.use(function*(next) {
        yield this.render('index')
      })

      return request(app.listen())
        .get('/')
        .set('Cookie', 'locale=zh-cn')
        .expect(/英文/)
        .expect(200)
    })
  })

  describe('working together with koa-views, jade render', () => {
    it('should be render by zh-cn locale', () => {
      var app = koa()

      locale(app, 'lang')

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        modes: ['cookie']
      }))

      app.use(views(__dirname + '/fixtures/', {
        default: 'jade'
      }))

      app.use(function*(next) {
        yield this.render('index')
      })

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
      app = koa()

      locale(app)

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        modes: ['cookie', 'header']
      }))

      app.use(function*(next) {
        this.body = this.i18n.__("locales.zh-CN")
      })
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
      app = koa()

      locale(app)

      app.use(function* dummyMiddleware(next) {
        this.state.defaultLocale = 'en'
        yield next
      })

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        modes: ['cookie', customMode]
      }))

      app.use(function*(next) {
        this.body = this.i18n.__("locales.zh-CN")
      })
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
})
