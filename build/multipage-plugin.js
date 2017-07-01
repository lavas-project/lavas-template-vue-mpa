/* eslint-disable */

// TODO: 在pr通过之前，先使用

var webpack = require("webpack");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var TemplatedPathPlugin = require("webpack/lib/TemplatedPathPlugin");
var path = require("path");
var TEMPLATED_PATH_REGEXP_NAME = /\[name\]/gi;

function setPluginOptions (pluginOptions) {
    return {
        sharedChunkName: pluginOptions.sharedChunkName || 'shared',
        vendorChunkName: pluginOptions.vendorChunkName || 'vendor',
        inlineChunkName: pluginOptions.inlineChunkName || 'inline',
        bootstrapFilename: pluginOptions.bootstrapFilename || 'inline.chunk.js',
        templateFilename: pluginOptions.templateFilename || 'index.html',
        templatePath: pluginOptions.templatePath || 'templates/[name]',
        htmlTemplatePath: pluginOptions.htmlTemplatePath || undefined,
        htmlWebpackPluginOptions: pluginOptions.htmlWebpackPluginOptions || {}
    };
}

function MultipageWebpackPlugin(pluginOptions) {
    Object.assign(this, setPluginOptions(pluginOptions || {}));
}

MultipageWebpackPlugin.prototype.getFullTemplatePath = function(entryKey) {
    var appliedTemplatedPath = this.templatePath;
    var appliedTemplatedFilename = this.templateFilename;
    appliedTemplatedPath = appliedTemplatedPath.replace(TEMPLATED_PATH_REGEXP_NAME, entryKey);
    appliedTemplatedFilename = appliedTemplatedFilename.replace(TEMPLATED_PATH_REGEXP_NAME, entryKey);

    return path.join(appliedTemplatedPath, appliedTemplatedFilename);
}

MultipageWebpackPlugin.prototype.apply = function(compiler) {
    var self = this;
    var webpackConfigOptions = compiler.options;
    var entriesToCreateTemplatesFor = Object.keys(webpackConfigOptions.entry)
        .filter(function (entry) {
            return entry !== this.vendorChunkName;
        });

    entriesToCreateTemplatesFor.forEach(function (entryKey) {
        var htmlWebpackPluginOptions = {
            filename: self.getFullTemplatePath(entryKey),
            chunksSortMode: 'dependency',
            chunks: ['inline', self.vendorChunkName, entryKey, self.sharedChunkName]
        };

        if (typeof self.htmlTemplatePath !== "undefined") {
            htmlWebpackPluginOptions.template = self.htmlTemplatePath.replace(TEMPLATED_PATH_REGEXP_NAME, entryKey);
        }

        compiler.apply(
            new HtmlWebpackPlugin(Object.assign(self.htmlWebpackPluginOptions, htmlWebpackPluginOptions))
        );
    });

    compiler.apply(
        new webpack.optimize.CommonsChunkPlugin({
            name: "shared",
            minChunks: entriesToCreateTemplatesFor.length || 3,
            chunks: Object.keys(webpackConfigOptions.entry)
        }),      
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            minChunks: Infinity,
            chunks: ["vendor"]
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "inline",
            filename: this.bootstrapFilename,
            minChunks: Infinity
        })
    );
}

module.exports = MultipageWebpackPlugin;
