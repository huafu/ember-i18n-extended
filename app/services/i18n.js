/* globals require */
import Ember from 'ember';
import I18nTreeLocaleNode from '../libs/i18n/tree/locale-node';
import computed from '../libs/i18n/computed';
import ENV from '../config/environment';


var forEach = Ember.EnumerableUtils.forEach;
var slice = [].slice;

export var UNDEFINED_CONTEXT = '__no_context_defined__';

/**
 * Used to protect a string helper from being called with wrong arguments
 * @param helper
 * @return {Function}
 */
function protectStringHelper(helper) {
  return function () {
    var args = slice.call(arguments);
    if (args[0] == null) {
      args[0] = '';
    }
    else if (typeof args[0] === 'number') {
      args[0] = '' + args[0];
    }
    else if (typeof args[0] !== 'string') {
      Ember.warn('[i18n] Called a string helper with `' + args[0] + '` instead of a string.');
      args[0] = '' + args[0];
    }
    return helper.apply(null, args);
  };
}

/**
 * @class I18nService
 * @extends Ember.Object
 * @uses Ember.Evented
 */
export default Ember.Object.extend(Ember.Evented, {
  /**
   * Our i18n configuration
   * @property config
   * @type {{enabledLocales: Array.<string>, defaultLocale: string, bundledLocales: Array.<string>, includeCurrencies: boolean, includeLanguages: boolean, includeNativeLanguages: boolean, path: string, defaultDateFormat: string}}
   */
  config: computed.ro(function () {
    return JSON.parse(Ember.$('meta[name="ember-i18n"]').attr('content'));
  }),

  /**
   * Default date format
   * @property defaultDateFormat
   * @type {string}
   */
  defaultDateFormat: computed.readOnly('config.defaultDateFormat'),

  /**
   * The path to the i18n files
   * @property dataFilesPath
   * @type {string}
   */
  dataFilesPath: computed.readOnly('config.path'),

  /**
   * The name of the `common` context
   * @property commonContextName
   * @type {string}
   */
  commonContextName: computed.readOnly('config.commonContextName'),

  /**
   * The default locale
   * @property defaultLocale
   * @type {string}
   */
  defaultLocale: computed.readOnly('config.defaultLocale'),

  /**
   * The fallback locale
   * @property fallbackLocale
   * @type {string}
   */
  fallbackLocale: computed.readOnly('config.fallbackLocale'),

  /**
   * List of bundled locales
   * @property bundledLocales
   * @type {Ember.Array.<string>}
   */
  bundledLocales: computed.readOnlyArray('config.bundledLocales'),

  /**
   * The current locale
   * @property currentLocale
   * @type {string}
   */
  currentLocale: computed.oneWay('defaultLocale'),

  /**
   * Enabled locales
   * @property enabledLocales
   * @type {Ember.Array.<string>}
   */
  enabledLocales: computed.readOnlyArray('config.enabledLocales'),

  /**
   * Show the key path when a translation is missing?
   * @property showKeyWhenMissing
   * @type {boolean}
   */
  showKeyWhenMissing: computed.anyDefined('config.showKeyWhenMissing', 'isDevOrTestEnv'),

  /**
   * Are we in dev or test env?
   * @property isDevOrTestEnv
   * @type {boolean}
   */
  isDevOrTestEnv: ENV.environment === 'development' || ENV.environment === 'test',

  /**
   * List of all native languages
   * @property nativeLanguages
   * @type {Ember.Array.<{code: string, name: string}>}
   */
  nativeLanguages: computed.ro('config.includeNativeLanguages', 'enabledLocales', function () {
    var res = [], langMap, locales;
    if (this.get('config.includeNativeLanguages')) {
      locales = this.get('enabledLocales');
      langMap = this.get('helpers._base._langMap');
      if (this.get('isDevOrTestEnv')) {
        res.push(Ember.Object.create({code: 'dev', name: '[DEVELOPMENT]'}));
      }
      forEach(Ember.keys(langMap), function (key) {
        if (locales.indexOf(key) !== -1) {
          res.push(Ember.Object.create({code: key, name: langMap[key]}));
        }
      });
    }
    return Ember.A(res);
  }),

  /**
   * All our helpers
   * @property helpers
   * @type {{}}
   */
  helpers: computed.ro(function () {
    var res = Object.create(null),
      basePath = ENV.modulePrefix + '/' + this.get('config.path') + '/',
      basePathLength = basePath.length;
    Ember.keys(require.entries).forEach(function (name) {
      var baseName, paths, locale, isCoreHelper = true;
      if (name.substr(0, basePathLength) === basePath) {
        baseName = name.substr(basePathLength);

        paths = baseName.split('/');
        locale = paths[0];
        if (locale === '_core') {
          // global place
          locale = '_base';
        }
        else {
          paths.shift();
        }
        // we do not want to handle stuff not in _core
        if (paths.shift() !== '_core') {
          return;
        }
        if (paths[0] === 'helpers') {
          isCoreHelper = false;
          paths.shift();
        }
        // if we have deeper paths, do not handle them
        if (paths.length > 1) {
          return;
        }
        // now build the name of our helper and create the hierarchy
        baseName = (isCoreHelper ? '_' : '') + Ember.String.camelize(paths[0]);
        if (!res[locale]) {
          res[locale] = Object.create(null);
        }
        res[locale][baseName] = require(name)['default'];
      }
    });
    // import some string helpers from Ember
    Ember.A([
      "fmt", "decamelize", "dasherize", "camelize", "classify", "underscore", "capitalize",
      "htmlSafe", "pluralize", "singularize"]).forEach(function (name) {
      res._base[name] = protectStringHelper(Ember.String[name]);
    });
    res._base.config = Ember.copy(this.get('config'), true);
    res._base.config.environment = ENV.environment;
    return res;
  }),

  /**
   * All locales
   * @property locales
   * @type {Ember.Object}
   */
  locales: computed.ro(function () {
    var service = this;
    return Ember.Object.extend({
      unknownProperty: function (key) {
        var locale;
        if (service.get('enabledLocales').contains(key)) {
          locale = I18nTreeLocaleNode.create({nodeName: key, service: service});
          this.set(key, locale);
          return locale;
        }
        else {
          Ember.warn('[i18n] Trying to load locale `' + key + '` but it is not enabled in the config.');
          this.set(key, undefined);
        }
      }
    }).create({});
  }),

  /**
   * The currently selected locale node
   * @property localeNode
   * @type {I18nTreeLocaleNode}
   */
  localeNode: computed.ro('currentLocale', function () {
    return this.get('locales.' + this.get('currentLocale'));
  }),

  /**
   * Translates the given i18n key full path using optional given arguments
   *
   * @method translate
   * @param {string} key
   * @param {*} [args...]
   * @return {Promise}
   */
  translate: function (key) {
    var args = slice.call(arguments, 1);
    var node = this.get('localeNode.' + key);
    return node
      .then(function () {
        return node.get('translateFunction').apply(null, args);
      });
  },

  /**
   * Same as translate, but if the translation isn't found it returns a fallback value
   *
   * @method translateNoError
   * @param {string} key
   * @param {*} [args...]
   * @return {Promise}
   */
  translateNoError: function (key) {
    var _this = this;
    return this.translate.apply(this, arguments).catch(function () {
      return _this.get('showKeyWhenMissing') ? key : '';
    });
  },


  /**
   * Synchronized version of `translate`. You'll always get a result, but if the context files are
   * not yet loaded you'll get an empty string (or the key path in dev/test).
   *
   * @method translateSync
   * @param {string} key
   * @param {*} [args...]
   * @return {string}
   */
  translateSync: function (key) {
    var args = slice.call(arguments, 1);
    return this.get('localeNode.' + key + '.translateFunction').apply(null, args);
  },

  logDebugInfo: Ember.on('init', function () {
    Ember.debug(
      '[i18n] Initialized i18n service. Default locale: ' + this.get('defaultLocale') +
      '. Enabled locales: ' + this.get('enabledLocales').join(', ') +
      '. Bundled locales: ' + this.get('bundledLocales').join(', ') + '.'
    );
  })

});
