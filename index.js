/* jshint node: true */
'use strict';
var helpers = require('./lib/helpers');
var fs = require('fs');

/**
 * @class Config
 * @type {{i18n: {enabledLocales: Array.<string>, defaultLocale: string, bundledLocales: Array.<string>, includeCurrencies: boolean, includeLanguages: boolean, includeNativeLanguages: boolean}, l10n: {}}}
 */

/**
 * Parse configuration given an EmberApp
 * @param {EmberApp|EmberAddon} app
 * @return Config
 */
function parseConfig(app) {
  var conf = app.project.config(app.env), i18nConf, l10nConf, resConf, defaultLocale;
  defaultLocale = (app.env === 'development' || app.env === 'test') ? helpers.DEV_LOCALE : 'en';
  resConf = {
    i18n: i18nConf = conf.i18n || {},
    l10n: l10nConf = conf.l10n || {}
  };
  // by default include the native language list
  if (!i18nConf.hasOwnProperty('includeNativeLanguages')) {
    i18nConf.includeNativeLanguages = true;
  }
  if (!i18nConf.defaultLocale) {
    i18nConf.defaultLocale = defaultLocale;
  }
  if (!i18nConf.enabledLocales) {
    i18nConf.enabledLocales = helpers.listProjectLocales(app.project.root, null, false, true);
  }
  if (i18nConf.enabledLocales.indexOf(i18nConf.defaultLocale) === -1) {
    i18nConf.enabledLocales.push(i18nConf.defaultLocale);
  }
  if ((app.env === 'development' || app.env === 'test') && i18nConf.enabledLocales.indexOf(helpers.DEV_LOCALE) === -1) {
    i18nConf.enabledLocales.unshift(helpers.DEV_LOCALE);
  }
  // filter and warn about wrong ones
  i18nConf.enabledLocales = helpers.filterLocales(i18nConf.enabledLocales, true);
  // if the bundled is not set, set the default locale as bundled
  if (!i18nConf.bundledLocales) {
    i18nConf.bundledLocales = [i18nConf.defaultLocale];
  }
  else {
    i18nConf.bundledLocales = i18nConf.bundledLocales.filter(function (locale) {
      var res = i18nConf.enabledLocales.indexOf(locale) !== -1;
      if (!res) {
        console.warn(
          '[i18n] Locale `' + locale +
          '` has been removed from the bundled locales since it is not in the list of enabled locales.'
        );
      }
      return res;
    });
  }
  return resConf;
}

module.exports = {
  name: 'ember-i18n-and-l10n',

  /**
   * @type Config
   */
  selfConfig: null,

  included: function (app, parentAddon) {
    var target = app || parentAddon;
    this.selfConfig = parseConfig(target);
  },


  pathForApp: function () {
    var trees = [], FILES = helpers.FILES, localFiles;
    // include the native language map
    if (this.selfConfig.i18n.includeNativeLanguages) {
      trees.push(this.pickFiles(this.treeGenerator(helpers.i18nPath(helpers.SELF_DATA_PATH)), {
        srcDir:  '/',
        files:   ['' + FILES.COMMON.LANGUAGE_MAP],
        destDir: '/i18n'
      }));
    }
    // make a list of the files to import for each language
    localFiles = ['' + FILES.LOCALIZED.ICU];
    if (this.selfConfig.i18n.includeCurrencies) {
      localFiles.push('' + FILES.LOCALIZED.CURRENCY_MAP);
    }
    if (this.selfConfig.i18n.includeLanguages) {
      localFiles.push('' + FILES.LOCALIZED.LANGUAGE_MAP);
    }
    // add for each enabled locale the core files
    this.selfConfig.enabledLocales.forEach(function (locale) {
      trees.push(this.pickFiles(this.treeGenerator(helpers.i18nPath(helpers.SELF_DATA_PATH, locale)), {
        srcDir:  '/',
        files:   localFiles,
        destDir: '/i18n/' + locale
      }));
    });
    // add for each bundled locale the data files
    this.selfConfig.bundledLocales.forEach(function (locale) {
      var root = helpers.i18nPath(this.project.root, locale);
      if (fs.existsSync(root)) {
        trees.push(this.pickFiles(root, {
          srcDir:  '/',
          files:   ['**/*.js'],
          destDir: '/i18n/' + locale
        }));
      }
    });
    return this.mergeTrees(trees);
  },

  pathForPublic: function () {
    var trees = [], locales;
    // make the list of enabled but not bundled locales
    locales = this.selfConfig.i18n.enabledLocales.filter(function (locale) {
      return this.selfConfig.i18n.bundledLocales.indexOf(locale) === -1;
    });
    // add for each enabled locale which is not bundled the data files
    locales.forEach(function (locale) {
      var root = helpers.i18nPath(this.project.root, locale);
      if (fs.existsSync(root)) {
        trees.push(this.pickFiles(root, {
          srcDir:  '/',
          files:   ['**/*.js'],
          destDir: '/i18n/' + locale
        }));
      }
    });
    return this.mergeTrees(trees);
  }
};
