# koa-i18n

> I18n fro koa, based on [i18n-2].
> **NOTE**: If want to use koa-i18n, [koa-locale] must be required!

[![NPM version][npm-img]][npm-url]
[![Build status][travis-img]][travis-url]
[![Test coverage][coveralls-img]][coveralls-url]
[![License][license-img]][license-url]
[![Dependency status][david-img]][david-url]

koa-i18n version | branch | koa version
---------------- | ------ | -----------
1.x **latest**   | v1.x   | 1.x **latest**
2.x **next**     | master | 2.x **next**

### Installation

```bash
$ npm install koa-i18n
```

### Usage

```js
const Koa = require('koa')
const convert = require('koa-convert')
const locale = require('koa-locale') //  detect the locale
const render = require('koa-swig')   //  swig render
const i18n = require('koa-i18n')

const app = new Koa()

// Required!
locale(app)

app.context.render = render({
  root: __dirname + '/views/',
  ext: 'html'
})

app.use(i18n(app, {
  directory: './config/locales',
  locales: ['zh-CN', 'en'], //  `zh-CN` defualtLocale, must match the locales to the filenames
  modes: [
    'query',                //  optional detect querystring - `/?locale=en-US`
    'subdomain',            //  optional detect subdomain   - `zh-CN.koajs.com`
    'cookie',               //  optional detect cookie      - `Cookie: locale=zh-TW`
    'header',               //  optional detect header      - `Accept-Language: zh-CN,zh;q=0.5`
    'url',                  //  optional detect url         - `/en`
    'tld',                  //  optional detect tld(the last domain) - `koajs.cn`
    function() {}           //  optional custom function (will be bound to the koa context)
  ]
}))

app.use(function (ctx) {
  ctx.body = ctx.i18n.__('any key');
})

app.use(convert(function *() {
  yield this.render('index')
}))
```

> **Tip**: We can change position of the elements in the `modes` array.
> If one mode is detected, no continue to detect.


### Dependencies

* [i18n-2][]
* [koa-locale][] - Get locale variable from query, subdomain, accept-languages or cookie


### License

  MIT

[i18n-2]: https://github.com/jeresig/i18n-node-2
[koa-locale]: https://github.com/koa-modules/koa-locale

[npm-img]: https://img.shields.io/npm/v/koa-i18n.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-i18n
[travis-img]: https://img.shields.io/travis/koa-modules/i18n.svg?style=flat-square
[travis-url]: https://travis-ci.org/koa-modules/i18n
[coveralls-img]: https://img.shields.io/coveralls/koa-modules/i18n.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/koa-modules/i18n?branch=master
[license-img]: https://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE
[david-img]: https://img.shields.io/david/koa-modules/i18n.svg?style=flat-square
[david-url]: https://david-dm.org/koa-modules/i18n
