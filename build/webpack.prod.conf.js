/**
 * @file 生产环境 webpack 配置文件
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

/* eslint-disable no-console */

var path = require('path');
var utils = require('./utils');
var webpack = require('webpack');
var config = require('../config');
var merge = require('webpack-merge');
var baseWebpackConfig = require('./webpack.base.conf');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
var SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
var SkeletonWebpackPlugin = require('vue-skeleton-webpack-plugin');
var SwRegisterWebpackPlugin = require('sw-register-webpack-plugin');
var WebpackCdnPlugin = require('webpack-cdn-plugin');
const MultipageWebpackPlugin = require('./multipage-plugin');

var env = process.env.NODE_ENV === 'testing'
    ? require('../config/test.env')
    : config.build.env;

function resolve(dir) {
    return path.join(__dirname, '..', dir);
}

var webpackConfig = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({
            sourceMap: config.build.productionSourceMap,
            extract: true
        })
    },
    externals: {
        vue: 'Vue',
        vuetify: 'Vuetify'
    },
    devtool: config.build.productionSourceMap ? '#source-map' : false,
    output: {
        path: config.build.assetsRoot,
        filename: utils.assetsPath('js/[name].[chunkhash].js'),
        chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
    },
    plugins: [
        // http://vuejs.github.io/vue-loader/en/workflow/production.html
        new webpack.DefinePlugin({
            'process.env': env
        }),

        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: true
        }),

        // extract css into its own file
        new ExtractTextPlugin({
            filename: utils.assetsPath('css/[name].[contenthash].css')
        }),

        // Compress extracted CSS. We are using this plugin so that possible
        // duplicated CSS from different components can be deduped.
        new OptimizeCSSPlugin({
            cssProcessorOptions: {
                safe: true
            }
        }),

        new SkeletonWebpackPlugin({
            webpackConfig: require('./webpack.skeleton.conf')
        }),

        new MultipageWebpackPlugin({
            bootstrapFilename: utils.assetsPath('js/manifest.[chunkhash].js'),
            templateFilename: '[name].html',
            templatePath: config.build.assetsRoot,
            htmlTemplatePath: resolve('src/pages/[name]/index.html'),
            htmlWebpackPluginOptions: {
                inject: true,
                minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true
                },
                favicon: utils.assetsPath('img/icons/favicon.ico')
            }
        }),

        // https://github.com/van-nguyen/webpack-cdn-plugin
        new WebpackCdnPlugin({
            modules: [
                {
                    name: 'vue',
                    var: 'Vue',
                    path: 'dist/vue.runtime.min.js'
                },
                {
                    name: 'vuetify',
                    var: 'Vuetify'
                }
            ]
        }),

        // copy custom static assets
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: config.build.assetsSubDirectory,
                ignore: ['.*']
            }
        ]),

        // service worker caching
        new SWPrecacheWebpackPlugin(config.swPrecache.build),
        new SwRegisterWebpackPlugin({
            filePath: path.resolve(__dirname, '../src/sw-register.js')
        })
    ]
});

if (config.build.productionGzip) {
    var CompressionWebpackPlugin = require('compression-webpack-plugin');

    webpackConfig.plugins.push(
        new CompressionWebpackPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp(''
                + '\\.('
                + config.build.productionGzipExtensions.join('|')
                + ')$'
            ),
            threshold: 10240,
            minRatio: 0.8
        })
    );
}

if (config.build.bundleAnalyzerReport) {
    var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
