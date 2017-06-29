// TODO: 在pr通过之前，先使用

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TemplatedPathPlugin = require("webpack/lib/TemplatedPathPlugin");
const path = require("path");
const TEMPLATED_PATH_REGEXP_NAME = /\[name\]/gi;

function setPluginOptions (pluginOptions) {
  const {
    sharedChunkName,
    vendorChunkName,
    inlineChunkName,
    bootstrapFilename,
    templateFilename,
    templatePath,
    htmlTemplatePath,
    htmlWebpackPluginOptions
  } = pluginOptions

  return {
    sharedChunkName: sharedChunkName || 'shared',
    vendorChunkName: vendorChunkName || 'vendor',
    inlineChunkName: inlineChunkName || 'inline',
    bootstrapFilename: bootstrapFilename || 'inline.chunk.js',
    templateFilename: templateFilename || 'index.html',
    templatePath: templatePath || 'templates/[name]',
    htmlTemplatePath: htmlTemplatePath || undefined,
    htmlWebpackPluginOptions: htmlWebpackPluginOptions || {}
  };
}

class MultipageWebpackPlugin {
  constructor (pluginOptions = {}) {
    Object.assign(this, setPluginOptions(pluginOptions))
  }
  
  getFullTemplatePath (entryKey) {
    let [appliedTemplatedPath, appliedTemplatedFilename] = [this.templatePath,this.templateFilename]
      .map(pathStr => pathStr.replace(TEMPLATED_PATH_REGEXP_NAME, `${entryKey}`));

    return path.join(appliedTemplatedPath, appliedTemplatedFilename);
  }

  apply (compiler) {
    console.error("HTML TEMPLATE PATH", this.htmlTemplatePath);
    
    let {options: webpackConfigOptions} = compiler;
    let entriesToCreateTemplatesFor = Object
      .keys(webpackConfigOptions.entry)
      .filter(entry => entry !== this.vendorChunkName);
      

    entriesToCreateTemplatesFor.forEach((entryKey) => {
      let htmlWebpackPluginOptions = {
        filename: this.getFullTemplatePath(entryKey),
        chunksSortMode: 'dependency',
        chunks: ['inline', this.vendorChunkName, entryKey, this.sharedChunkName]
      };

      if (typeof this.htmlTemplatePath !== "undefined") {
        htmlWebpackPluginOptions.template = this.htmlTemplatePath.replace(TEMPLATED_PATH_REGEXP_NAME, `${entryKey}`);
      }

      compiler.apply(
        new HtmlWebpackPlugin(Object.assign(this.htmlWebpackPluginOptions, htmlWebpackPluginOptions))
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
}
module.exports = MultipageWebpackPlugin;
