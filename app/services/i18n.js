/* globals require */
import Ember from 'ember';
import I18nLocale from '../libs/i18n/locale';
import computed from '../libs/i18n/computed';
import ENV from '../config/environment';

var map = Ember.EnumerableUtils.map;
var slice = [].slice;

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
    if (typeof args[0] !== 'string') {
      args[0] = args[0].toString();
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
   * Known contexts
   * @property knownContexts
   * @type {Ember.Array.<string>}
   */
  knownContexts: computed.ro(function () {
    return Ember.A([]);
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
          locale = I18nLocale.create({code: key, service: service});
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
   * All node locales
   * @property nodeLocales
   * @type {Ember.Array.<I18nLocale>}
   */
  nodeLocales: computed.ro('currentLocale', 'fallbackLocale', function () {
    var locales = [], opt = this.getProperties('currentLocale', 'fallbackLocale');
    if (opt.currentLocale) {
      locales.push(opt.currentLocale);
    }
    if (opt.fallbackLocale && locales.indexOf(opt.fallbackLocale) === -1) {
      locales.push(opt.fallbackLocale);
    }
    return Ember.A(map(locales, function (locale) {
      return Ember.Object.create({nodeLocale: this.get('locales.' + locale)});
    }, this));
  }),

  /**
   * Current helpers
   * @property currentHelpers
   * @type {Object}
   */
  currentHelpers: computed.ro('currentLocale', function () {
    return this.get('locales.' + this.get('currentLocale') + '.helpers');
  }),


  /**
   * Handle the load of a context
   *
   * @method handleContextLoaded
   * @param {I18nContext} context
   */
  handleContextLoaded: Ember.on('didLoadContext', function (context) {
    var knownContexts, name;
    knownContexts = this.get('knownContexts');
    name = context.get('name');
    if (!knownContexts.contains(name)) {
      knownContexts.pushObject(name);
    }
    if (!context.get('isError')) {
      Ember.debug('[i18n] Successfully loaded context `' + name + '` for locale `' + context.get('locale.code') + '`.');
    }
  }),

  logDebugInfo: Ember.on('init', function () {
    Ember.debug(
      '[i18n] Initialized i18n service. Default locale: ' + this.get('defaultLocale') +
      '. Enabled locales: ' + this.get('enabledLocales').join(', ') +
      '. Bundled locales: ' + this.get('bundledLocales').join(', ') + '.'
    );
  })

});
