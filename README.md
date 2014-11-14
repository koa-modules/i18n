# koa-i18n [![Build Status](https://travis-ci.org/koa-modules/koa-i18n.svg)](https://travis-ci.org/koa-modules/koa-i18n)

  I18n fro koa.    
  Based on [i18n-2][].   
  ***NOTE: If want to use koa-i18n, [koa-locale][] muste be requred!***   
  ***NOTE: If want to work together with templates render, [koa-locals][] must be required!***


### Usage

#### Install

```
npm install koa-i18n
```

#### Example

```js
var app = require('koa')();
var locale = require('koa-locale'); //  detect the locale
var locals = require('koa-locals'); //  local variables for templates render
var render = require('koa-swig');   //  swig render
var i18n = require('koa-i18n');

// Required! 
locale(app);

// Working together with template render must require!
locals(app)
render(app, {
  root: __dirname + '/views/',
  ext: 'html'
});

app.use(i18n(app, {
  directory: './config/locales',
  locales: ['zh-CN', 'en'],       //  `zh-CN` defualtLocale, must match the locales to the filenames
  query: true,                    //  optional detect querystring - `/?lang=en-US`
  subdomain: true,                //  optional detect subdomain   - `zh-CN.koajs.com`
  cookie: true,                   //  optional detect cookie      - `Accept-Language: zh-CN,zh;q=0.5`
  header: true                    //  optional detect header      - `Cookie: lang=zh-TW`
}));

app.use(function *(next) {
  this.body = this.i18n.__('any key');
});

app.use(function *(next) {
  yield this.render('index')
});
```


#### Dependencies

* [i18n-2][]
* [koa-locale][] - Get locale variable from query, subdomain, accept-languages or cookie


### License

MIT


[i18n-2]: https://github.com/jeresig/i18n-node-2
[koa-locale]: https://github.com/koa-modules/koa-locale
[koa-locals]: https://github.com/koa-modules/koa-locals
