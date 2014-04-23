var app = require('koa')();
var locale = require('koa-locale'); //  detect the locale
var i18n = require('..');

// Required! 
locale(app);

app.use(i18n(app, {
  directory: __dirname + '/locales',
  locales: ['zh-cn', 'en'],       //  `zh-CN` defualtLocale
  query: true                     //  optional detect querystring - `/?lang=en-US`
}));

app.use(function *(next) {
  this.body = this.i18n.__("locales.zh-CN");
});

app.listen(3000);
