/* eslint-disable */

'use strict';

// TODO: 在 pr 通过之前，先使用
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TemplatedPathPlugin = require("webpack/lib/TemplatedPathPlugin");
const path = require("path");
const TEMPLATED_PATH_REGEXP_NAME = /\[name\]/gi;

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

MultipageWebpackPlugin.prototype.getFullTemplatePath = function (entryKey) {
    let appliedTemplatedPath = this.templatePath;
    let appliedTemplatedFilename = this.templateFilename;
    appliedTemplatedPath = appliedTemplatedPath.replace(TEMPLATED_PATH_REGEXP_NAME, entryKey);
    appliedTemplatedFilename = appliedTemplatedFilename.replace(TEMPLATED_PATH_REGEXP_NAME, entryKey);

    return path.join(appliedTemplatedPath, appliedTemplatedFilename);
}

MultipageWebpackPlugin.prototype.apply = function(compiler) {
    let self = this;
    let webpackConfigOptions = compiler.options;
    let entriesToCreateTemplatesFor = Object.keys(webpackConfigOptions.entry)
        .filter(function (entry) {
            return entry !== self.vendorChunkName;
        });

    entriesToCreateTemplatesFor.forEach(function (entryKey) {
        let htmlWebpackPluginOptions = {
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
