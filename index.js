/* jshint node: true */
'use strict';
var helpers = require('./lib/helpers');
//var commands = require('./lib/commands');
var fs = require('fs');
var sysPath = require('path');

/**
 * @class Config
 * @type {{i18n: {enabledLocales: Array.<string>, defaultLocale: string, bundledLocales: Array.<string>, includeCurrencies: boolean, includeLanguages: boolean, includeNativeLanguages: boolean}, l10n: {}}}
 */

module.exports = {
  name: 'ember-i18n-extended',

  /**
   * @type Config
   */
  selfConfig: null,


  /*includedCommands: function () {
   return commands;
   },*/

  included: function (app, parentAddon) {
    var target = app || parentAddon;
    this.selfConfig = helpers.parseConfig(target);
  },

  contentFor: function (type) {
    var json;
    if (type === 'head') {
      json = JSON.stringify(this.selfConfig.i18n);
      return "<meta name='ember-i18n' content='" + json + "'>";
    }
  },


  treeForApp: function (tree) {
    var trees = [tree], FILES = helpers.FILES, localFiles, root;

    // include the native language map
    if (this.selfConfig.i18n.includeNativeLanguages) {
      trees.push(this.pickFiles(this.treeGenerator(helpers.i18nPath(helpers.SELF_DATA_PATH)), {
        srcDir:  '/',
        files:   ['' + FILES.COMMON.LANGUAGE_MAP],
        destDir: '/i18n'
      }));
    }

    // include our core helpers
    trees.push(this.pickFiles(this.treeGenerator(helpers.i18nPath(helpers.SELF_DATA_PATH)), {
      srcDir:  '/',
      files:   ['_core/helpers/*.js'],
      destDir: '/i18n'
    }));

    // include the helpers and other core stuff if any
    root = helpers.i18nPath(this.project.root);
    if (fs.existsSync(helpers.normalizePath(root, '_core'))) {
      trees.push(this.pickFiles(root, {
        srcDir:  '/',
        files:   ['_core/**/*.js'],
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
    this.selfConfig.i18n.enabledLocales.forEach(function (locale) {
      var fakeLocale = locale === helpers.DEV_LOCALE ? 'en' : locale;
      trees.push(this.pickFiles(this.treeGenerator(helpers.i18nPath(helpers.SELF_DATA_PATH, fakeLocale)), {
        srcDir:  '/',
        files:   localFiles,
        destDir: '/i18n/' + locale
      }));
    }, this);

    // add for each bundled locale the data files
    this.selfConfig.i18n.bundledLocales.forEach(function (locale) {
      var root = helpers.i18nPath(this.project.root, locale);
      if (fs.existsSync(root)) {
        trees.push(this.pickFiles(root, {
          srcDir:  '/',
          files:   ['*.js'],
          destDir: '/i18n/' + locale
        }));
      }
    }, this);

    // include our test helpers
    if (this.app.env === 'development' || this.app.env === 'test') {
      trees.push(this.pickFiles(this.treeGenerator(sysPath.join(__dirname, 'lib', 'tests')), {
        srcDir:  '/',
        files:   ['**/*.js'],
        destDir: '/tests/helpers'
      }));
    }

    return this.mergeTrees(trees);
  },

  treeForPublic: function () {
    var trees = [], locales;
    // make the list of enabled but not bundled locales
    locales = this.selfConfig.i18n.enabledLocales.filter(function (locale) {
      return this.selfConfig.i18n.bundledLocales.indexOf(locale) === -1;
    }, this);
    // add for each enabled locale which is not bundled the data files
    locales.forEach(function (locale) {
      var root = helpers.i18nPath(this.project.root, locale);
      if (fs.existsSync(root)) {
        trees.push(this.pickFiles(root, {
          srcDir:  '/',
          files:   ['*.js'],
          destDir: '/i18n/' + locale
        }));
      }
    }, this);
    // then for each enabled locale, add the possible assets from the _assets folder
    locales = this.selfConfig.i18n.enabledLocales;
    locales.forEach(function (locale) {
      var root = sysPath.join(helpers.i18nPath(this.project.root, locale), '_assets');
      if (fs.existsSync(root)) {
        trees.push(this.pickFiles(root, {
          srcDir:  '/',
          files:   ['**/*'],
          destDir: '/i18n/' + locale + '/assets'
        }));
      }
    }, this);
    return this.mergeTrees(trees);
  }

};
