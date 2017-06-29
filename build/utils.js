/**
 * @file 工具包
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

/* eslint-disable no-console */

var path = require('path');
var fs = require('fs');
var config = require('../config');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

exports.assetsPath = function (newPath) {
    var assetsSubDirectory = process.env.NODE_ENV === 'production'
        ? config.build.assetsSubDirectory
        : config.dev.assetsSubDirectory
    ;
    return path.posix.join(assetsSubDirectory, newPath);
};

exports.cssLoaders = function (options) {
    options = options || {};

    var cssLoader = {
        loader: 'css-loader',
        options: {
            minimize: process.env.NODE_ENV === 'production',
            sourceMap: options.sourceMap
        }
    };

    // generate loader string to be used with extract text plugin
    function generateLoaders(loader, loaderOptions) {
        var loaders = [cssLoader];
        if (loader) {
            loaders.push({
                loader: loader + '-loader',
                options: Object.assign({}, loaderOptions, {
                    sourceMap: options.sourceMap
                })
            });
        }

        // Extract CSS when that option is specified
        // (which is the case during production build)
        if (options.extract) {
            return ExtractTextPlugin.extract({
                use: loaders,
                fallback: 'vue-style-loader'
            });
        }

        return ['vue-style-loader'].concat(loaders);
    }

    // https://vue-loader.vuejs.org/en/configurations/extract-css.html
    return {
        css: generateLoaders(),
        postcss: generateLoaders(),
        less: generateLoaders('less'),
        sass: generateLoaders('sass', {indentedSyntax: true}),
        scss: generateLoaders('sass'),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus')
    };
};

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
    var output = [];
    var loaders = exports.cssLoaders(options);

    Object.keys(loaders).forEach(function (extension) {
        var loader = loaders[extension];
        output.push({
            test: new RegExp('\\.' + extension + '$'),
            use: loader
        });
    });
    return output;
};

exports.getEntries = function (pageDir, entryPath) {
    var entry = {};
    var pageDirPath = path.join(__dirname, '..', pageDir);
    fs.readdirSync(pageDirPath)
        .filter(f => fs.statSync(path.join(pageDirPath, f)).isDirectory())
        .forEach(f => {
            entry[path.basename(f)] = pageDir + '/' + f + '/' + entryPath;
        });
    return entry;
};
