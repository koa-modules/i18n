# koa-i18n [![Build Status](https://travis-ci.org/fundon/koa-i18n.svg)](https://travis-ci.org/fundon/koa-i18n)

  I18n fro koa.    
  Based on [i18n-2][].


### Usage

#### Install

```
npm install koa-i18n
```

#### Example

```js
var app = require('koa')();
var i18n = require('koa-i18n');

app.use(i18n(app, {
  directory: './config/locales',
  locales: ['zh-CN', 'en']
}));
```


#### Dependencies

* [i18n-2][]
* [koa-locale][] - Get locale variable from query, subdomain, accept-languages or cookie


[i18n-2]: https://github.com/jeresig/i18n-node-2
[koa-locale]: https://github.com/fundon/koa-locale
