import Ember from 'ember';
import I18nLocale from '../libs/i18n/locale';
import computed from '../libs/i18n/computed';


/**
 * @class I18nService
 * @extends Ember.Object
 * @uses Ember.Evented
 */
export default Ember.Object.extend(Ember.Evented, {
  /**
   * Our i18n configuration
   * @property config
   * @type {{enabledLocales: Array.<string>, defaultLocale: string, bundledLocales: Array.<string>, includeCurrencies: boolean, includeLanguages: boolean, includeNativeLanguages: boolean}}
   */
  config: computed.ro(function () {
    return JSON.parse(Ember.$('meta[name="ember-i18n"]').attr('content'));
  }),

  /**
   * The default locale
   * @property defaultLocale
   * @type {string}
   */
  defaultLocale: computed.readOnly('config.defaultLocale'),

  /**
   * List of bundled locales
   * @property bundledLocales
   * @type {Ember.Array.<string>}
   */
  bundledLocales: computed.readOnlyArray('config.bundledLocales'),

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
    return Object.create(null);
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
