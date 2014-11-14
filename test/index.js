'use strict';

/**
 * Module dependencies.
 */

var path = require('path');
var request = require('supertest');
var koa = require('koa');
var compose = require('koa-compose');
var locale = require('koa-locale');
var locals = require('koa-locals');
var render = require('koa-swig');
var views = require('koa-views');
var i18n = require('..');

describe('koa-i18n', function () {

  describe('Detect the Querystring', function () {
    it('should be `en` locale', function (done) {
      var app = koa();

      locale(app);

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en'],
        query: true
      }));

      app.use(function *(next) {
        this.body = this.i18n.__("locales.en");
      });

      request(app.listen())
        .get('/?lang=en')
        .expect(/english/i)
        .expect(200, done);
    });
  });

  describe('Detect the Subdomain', function () {
    var app = koa();

    locale(app);

    var enApp = koa();
    enApp.use(function *() {
      this.body = this.getLocaleFromSubdomain();
    });
    enApp = compose(enApp);

    var zhCNApp = koa();
    zhCNApp.use(function *() {
      this.body = this.getLocaleFromSubdomain();
    });
    zhCNApp = compose(zhCNApp);

    app.use(function *(next) {
      switch (this.host) {
        case 'en.koajs.com':
          return yield enApp.call(this, next);
        case 'zh-CN.koajs.com':
          return yield zhCNApp.call(this, next);
      }
      yield next;
    });

    app.use(i18n(app, {
      directory: __dirname + '/fixtures/locales',
      locales: ['zh-CN', 'en', 'zh-tw'],
      subdomain: true
    }));

    app.use(function *(next) {
      this.body = this.i18n.__("locales.en");
    });

    it ('should be `en` locale', function (done) {
      request(app.listen())
        .get('/')
        .set('Host', 'eN.koajs.com')
        .expect(/English/)
        .expect(200, done);
    });

    it ('should be `zh-cn` locale', function (done) {
      request(app.listen())
        .get('/')
        .set('Host', 'zh-CN.koajs.com')
        .expect(/英文/)
        .expect(200, done);
    });

    it ('should be `zh-tw` locale', function (done) {
      request(app.listen())
        .get('/')
        .set('Host', 'zh-TW.koajs.com')
        .expect(/locales.en/)
        .expect(200, done);
    });

  });

  describe('Dected the header', function () {
    it('should be `zh-tw` locale', function (done) {
      var app = koa();

      locale(app);

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        header: true
      }));

      app.use(function *(next) {
        this.body = this.i18n.__("locales.zh-CN");
      });

      request(app.listen())
        .get('/')
        .set('Accept-Language', 'zh-TW')
        .expect(/簡體中文/)
        .expect(200, done);
    });
  });

  describe('Detect the cookie', function () {
    it('should be `zh-cn` locale', function (done) {
      var app = koa();

      locale(app, {
        lang: 'locale'
      });

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        cookie: true
      }));

      app.use(function *(next) {
        this.body = this.i18n.__("locales.zh-CN");
      });

      request(app.listen())
        .get('/')
        .set('Cookie', 'locale=zh-cn')
        .expect(/简体中文/)
        .expect(200, done);
    });
  });

  describe('working together, i18n and swig-render', function () {
    it('should be render by zh-cn locale', function (done) {
      var app = koa();

      locals(app);
      locale(app);

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        cookie: true
      }));

      render(app, {
        root: __dirname + '/fixtures/',
        ext: 'html'
      });

      app.use(function *(next) {
        yield this.render('index')
      });

      request(app.listen())
        .get('/')
        .set('Cookie', 'lang=zh-cn')
        .expect(/英文/)
        .expect(200, done);
    });
  });

  describe('working together with koa-views, jade render', function () {
    it('should be render by zh-cn locale', function (done) {
      var app = koa();

      locale(app);

      app.use(views(__dirname + '/fixtures/', 'jade'));

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        cookie: true
      }));

      app.use(function *(next) {
        yield this.render('index')
      });

      request(app.listen())
        .get('/')
        .set('Cookie', 'lang=zh-cn')
        .expect(/英文/)
        .expect(200, done);
    });
  });

});
