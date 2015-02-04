import Ember from 'ember';
import computed from '../computed';
import I18nTreeNode from './node';

import isValidKey from '../is-valid-key';
import compileTranslation from '../compile-translation';

var fmt = Ember.String.fmt;

var I18nTreeKeyNode;

//TODO: does this need to be cached?
function getBlankFunctionFor(key, debug) {
  var func;
  func = function () {
    return debug;
  };
  func.toString = function () {
    return key;
  };
  func.isI18nTranslate = true;
  func.isI18nInvalid = true;
  return func;
}

/**
 * @class I18nTreeKeyNode
 * @extends I18nTreeNode
 */
I18nTreeKeyNode = I18nTreeNode.extend({
  /**
   * @inheritDoc
   */
  forbiddenProperties: ['service', 'locale', 'context', 't', 's'],

  /**
   * Our children are I18nTreeKeyNode
   * @property childClass
   * @type {subclass of I18nTreeNode}
   */
  childClass: computed.overridable(function () {
    return I18nTreeKeyNode;
  }),

  /**
   * @inheritDoc
   */
  createChildNode: function (options) {
    return this._super(Ember.merge(options, this.getProperties('locale', 'service', 'context')));
  },

  /**
   * @inheritDoc
   */
  isValidPropertyName: function (name) {
    return this._super(name) && isValidKey(name);
  },

  /**
   * @inheritDoc
   */
  resolvePath: function (path, returnPath, options) {
    // handle the same ref as same context
    return this._super(path, returnPath, Ember.merge({ref: 'context'}, options));
  },

  /**
   * @inheritDoc
   */
  fallbackNodePath: computed.ro('nodeName', 'locale.code', 'service.fallbackLocale', function () {
    var locale, fallbackLocale, nodePath;
    fallbackLocale = this.get('service.fallbackLocale');
    locale = this.get('locale.code');
    if (!fallbackLocale || fallbackLocale === locale) {
      return;
    }
    nodePath = this.get('nodeFullPath');
    nodePath = nodePath.split('.');
    nodePath.shift();
    nodePath.unshift(fallbackLocale);
    return 'service.locales.' + nodePath.join('.');
  }),

  /**
   * Our locale
   * @property locale
   * @type {I18nTreeLocaleNode}
   */
  locale: null,

  /**
   * Our i18n service
   * @property service
   * @type {I18nService}
   */
  service: null,

  /**
   * Our context
   * @property context
   * @type {I18nTreeContextNode}
   */
  context: null,

  /**
   * Our translate function
   * @property translateFunction
   * @type {Function}
   */
  translateFunction: computed.ro('nodeValue', function () {
    var method = this.get('nodeValue'), helpers, translate, key, debug;
    if (method && method.isI18nBundle) {
      helpers = this.get('locale.helpers');
      translate = function () {
        return method.apply(helpers, arguments);
      };
      translate.toString = method.toString;
      translate.isI18nTranslate = true;
    }
    else {
      key = this.get('nodeFullPath');
      // do not return anything on production
      debug = this.get('service.showKeyWhenMissing') ? key : '';
      translate = getBlankFunctionFor(key, debug);
    }
    return translate;
  }),

  /**
   * Helper method for non async use
   *
   * @method t
   * @param {*} [params...]
   * @return {string}
   */
  t: function () {
    return this.get('translateFunction').apply(null, arguments);
  },

  /**
   * Helper property for use directly in the templates
   * @property s
   * @type {string}
   */
  s: computed.ro('translateFunction', function () {
    return this.t();
  }),

  /**
   * @inheritDoc
   */
  loadContent: function () {
    var _this = this;
    return this._super().then(function (content) {
      if (typeof content === 'string' || typeof content === 'function') {
        // compile and get our dependencies
        try {
          content = compileTranslation(content, _this.get('service.helpers._base'));
        }
        catch (err) {
          err.message = fmt(
            '[i18n] Error while building key `%@`: %@.',
            _this.get('nodeFullPath'), err.message
          );
          Ember.warn(err.message);
          return Ember.RSVP.reject(err);
        }
        // read the dependencies
        return content.bundleFor(_this);
      }
      return content;
    });
  }

});

export default I18nTreeKeyNode;
