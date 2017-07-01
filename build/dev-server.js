/**
 * @file 开发环境服务端
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

/* eslint-disable no-console */

'use strict';

require('./check-versions')();
const config = require('../config');

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV);
}

const opn = require('opn');
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const proxyMiddleware = require('http-proxy-middleware');
const webpackConfig = require('./webpack.dev.conf');
const utils = require('./utils');

// default port where dev server listens for incoming traffic
let port = process.env.PORT || config.dev.port;

// automatically open browser, if not set will be false
let autoOpenBrowser = !!config.dev.autoOpenBrowser;

// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
let proxyTable = config.dev.proxyTable;

let app = express();
let compiler = webpack(webpackConfig);

let devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
});

let hotMiddleware = require('webpack-hot-middleware')(compiler, {
    log: function () {}
});

// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
        hotMiddleware.publish({
            action: 'reload'
        });
        cb();
    });
});

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
    let options = proxyTable[context];
    if (typeof options === 'string') {
        options = {
            target: options
        };
    }
    app.use(proxyMiddleware(options.filter || context, options));
});

// 处理HTML5 history API，映射例如/home路由到/home/index.html
let rewrites = Object.keys(utils.getEntries('./src/pages', 'entry.js'))
    .map(function (entry) {
        return {
            from: new RegExp('/' + entry),
            to: '/' + entry + '/index.html'
        };
    });

app.use(require('connect-history-api-fallback')({
    htmlAcceptHeaders: ['text/html'],
    rewrites: rewrites
}));

// serve webpack bundle output
app.use(devMiddleware);

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware);

// serve pure static assets
let staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory);
app.use(staticPath, express.static('./static'));

let uri = 'http://localhost:' + port + '/home';

let newResolve;
let readyPromise = new Promise(function (resolve) {
    newResolve = resolve;
});

console.log('> Starting dev server...');

devMiddleware.waitUntilValid(function () {
    console.log('> Listening at ' + uri + '\n');

    // when env is testing, don't need open it
    if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
        opn(uri);
    }
    newResolve();
});

let server = app.listen(port);

module.exports = {
    ready: readyPromise,
    close: function () {
        server.close();
    }
};
