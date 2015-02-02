import Ember from 'ember';
import computed from '../libs/i18n/computed';
import translatePath from '../libs/i18n/translate-path';
import ENV from '../config/environment';

/**
 * @class I18nTranslationComponent
 * @alias ITComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  /**
   * @inheritDoc
   */
  tagName: 'span',

  /**
   * We have to use the layout and provide and empty template so that using the helper will
   * allow to use the template without deprecation warning
   * @inheritDoc
   */
  layoutName: 'i18n/components/i-t',

  /**
   * The i18n key
   * @property key
   * @type {string}
   */
  key: null,

  /**
   * The parameters
   * @property params
   * @type {Array}
   */
  params: computed(function (key, value) {
    var res, i, param;
    if (arguments.length > 1) {
      return this._fixedParams = value;
    }
    else {
      if (this._fixedParams) {
        return this._fixedParams;
      }
      else {
        res = [];
        i = 1;
        do {
          param = this.get('p' + i);
          i++;
        } while (param !== undefined && res.push(param));
        return res;
      }
    }
  }),

  /**
   * The resolved translation
   * @property translation
   * @type {string}
   */
  translation: computed.ro('possibleTranslations.@each', 'fallbackText', function () {
    return this.get('possibleTranslations').find(function (t) {
        return t != null;
      }) || this.get('fallbackText');
  }),

  /**
   * All possible translations
   * @property possibleTranslations
   * @type {Ember.Array.<string>}
   */
  possibleTranslations: computed.ro(
    'possibleKeys.@each', 'params.@each', 'i18n.nodeLocales.@each',
    function () {
      var keys = this.get('possibleKeys'), params = (this.get('params') || []), helpers = this.get('i18n.helpers');
      var translations = this.get('i18n.nodeLocales').reduce(function (previous, objWithNodeLocale) {
        return keys.reduce(function (previous, key) {
          var trFunc = objWithNodeLocale.get(translatePath(key));
          if (typeof trFunc === 'function') {
            previous.push(trFunc.apply(helpers, params.slice()));
          }
          return previous;
        }, previous);
      }, []);
      return Ember.A(translations);
    }
  ),

  /**
   * Fallback text
   * @property fallbackText
   * @type {string}
   */
  fallbackText: computed.ro('key', function () {
    if (ENV.environment === 'test' || ENV.environment === 'development') {
      return this.get('key');
    }
    else {
      return '...';
    }
  }),


  /**
   * The locale node from our service
   * @property nodeLocale
   * @type {I18nLocale}
   */
  nodeLocale: computed.readOnly('i18n.currentLocale'),


  /**
   * The fixed context from the controller
   * @property fixedContext
   * @type {string}
   */
  fixedContext: computed.oneWay('targetObject.i18nContext'),

  /**
   * The default context from the controller
   * @property defaultContext
   * @type {string}
   */
  defaultContext: computed.oneWay('targetObject.i18nDefaultContext'),

  /**
   * Possible contexts to use, in order
   * @property possibleKeys
   * @type {Ember.Array.<string>}
   */
  possibleKeys: computed.ro('defaultContext', 'fixedContext', 'key', function () {
    var parts, def, res, key = this.get('key');
    if (!key) {
      // not even got a key
      res = [];
    }
    else if (key.charAt(0) === '/') {
      // got a key with a leading `/`
      res = [key];
    }
    else if ((def = this.get('fixedContext'))) {
      // we got a fixed context
      res = ['/' + def + '.' + key];
    }
    else {
      // try to prepend each part of the route
      res = [];
      def = this.get('defaultContext');
      if (def) {
        parts = def.split('.');
        while (parts.length) {
          res.push('/' + parts.join('.') + '.' + key);
          parts.pop();
        }
      }
      if (key.indexOf('.') !== -1) {
        // suppose the coder forgot to put the `/`
        res.push('/' + key);
      }
    }
    return Ember.A(res);
  }),

  /**
   * The i18n service
   * @property i18n
   * @type {I18nService}
   */
  i18n: computed.ro(function () {
    return this.container.lookup('service:i18n');
  }),


  /**
   * Possible contexts
   * @property possibleContexts
   * @type {Ember.Array.<string>}
   */
  possibleContexts: computed.ro('possibleKeys.@each', function () {
    return this.get('possibleKeys').map(function (key) {
      return key.substr(1).split('.').shift();
    }, this).uniq();
  }),

  setupI18n: Ember.on('didInsertElement', function () {
    this.get('i18n').on('didLoadContext', this, 'handleContextLoaded');
  }),

  teardownI18n: Ember.on('willDestroyElement', function () {
    this.get('i18n').off('didLoadContext', this, 'handleContextLoaded');
  }),

  handleContextLoaded: function (context) {
    if (this._state === 'inDOM' && !context.get('isError')) {
      this.scheduleTranslationRefresh();
    }
  },

  scheduleTranslationRefresh: Ember.on('didInsertElement', function () {
    Ember.run.scheduleOnce('afterRender', this, 'refreshTranslation');
  }),

  refreshTranslation: function () {
    if (this._state === 'inDOM') {
      this.notifyPropertyChange('possibleTranslations');
    }
  }

});
