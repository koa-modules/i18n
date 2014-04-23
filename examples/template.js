var app = require('koa')();
var locale = require('koa-locale'); //  detect the locale
var locals = require('koa-locals');
var render = require('koa-swig');   //  swig render
var i18n = require('..');

// Required! 
locale(app);

// Working together with template render must require!
locals(app);
render(app, {
  root: __dirname,
  ext: 'html'
});

app.use(i18n(app, {
  directory: __dirname + '/locales',
  locales: ['zh-cn', 'en'],       //  `zh-CN` defualtLocale
  query: true                     //  optional detect querystring - `/?lang=en-US`
}));

app.use(function *(next) {
  yield this.render('index')
});

app.listen(3000);
