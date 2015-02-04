import Ember from 'ember';
import computed from '../../libs/i18n/computed';
import resolveKeyPath from '../../libs/i18n/resolve-key-path';
import I18nTreeKeyNode from '../../libs/i18n/tree/key-node';
import ENV from '../../config/environment';

var slice = Array.prototype.slice;
var snake = Ember.String.underscore;
var RETURN_EMPTY_STRING_FUNCTION = function () {
  return '';
};

export default Ember.Mixin.create({
  /**
   * The context of the key
   * @property i18nFixedContext
   * @type {string}
   */
  i18nFixedContext: null,

  /**
   * The default context to use if no fixed context
   * @property i18nDefaultContext
   * @type {string}
   */
  i18nDefaultContext: null,

  /**
   * THe i18n key
   * @property i18nKey
   * @type {string}
   */
  i18nKey: Ember.required(),

  /**
   * The full path to the key
   * @property i18nKeyResolvedPath
   * @type {string}
   */
  i18nKeyResolvedPath: computed.ro(
    'i18nFixedContext', 'i18nDefaultContext', 'i18nKey', 'i18n.localeNode',
    function () {
      var context, res, key, baseContext, parentContext, root;
      root = 'i18n.localeNode';
      key = this.get('i18nKey');
      if (key) {
        context = snake(this.get('i18nFixedContext') || this.get('i18nDefaultContext') || '');
        baseContext = context ? context.split('.').shift() : null;
        parentContext = context ?
          (context.indexOf('.') === -1 ?
            root : (root + '.' + context.split('.').slice(0, -1).join('.'))
          )
          : null;
        res = resolveKeyPath(key, {
          root:   root,
          dot:    false,
          ref:    baseContext ? root + '.' + baseContext : false,
          parent: parentContext
        });
        if (!res.resolved) {
          res.path = root + (context ? '.' + context : '') + '.' + res.path;
        }
        if (ENV.LOG_I18N_PATH_RESOLUTION) {
          Ember.debug('[i18n] Resolved `' + key + '` to `' + res.path + '`.');
        }
        return res.path;
      }
    }),

  /**
   * The resolved node
   * @property i18nKeyNode
   * @type I18nTreeKeyNode
   */
  i18nKeyNode: computed.ro('i18nKeyResolvedPath', function () {
    var path = this.get('i18nKeyResolvedPath');
    if (path) {
      return this.get(path);
    }
  }),

  /**
   * Translation function
   * @property i18nTranslateFunction
   * @type {Function}
   */
  i18nTranslateFunction: computed.ro('i18nKeyNode.translateFunction', function () {
    var node = this.get('i18nKeyNode');
    if (node instanceof I18nTreeKeyNode) {
      return node.get('translateFunction');
    }
    else {
      Ember.warn('[i18n] Trying to get the translate function of `' + node.get('nodeFullPath') + '` which is not a context key.');
      return RETURN_EMPTY_STRING_FUNCTION;
    }
  }),

  /**
   * The i18n service
   * @property i18n
   * @type {I18nService}
   */
  i18n: computed.overridable(function () {
    if (this.i18nService) {
      return this.i18nService;
    }
    else if (this.container) {
      return this.container.lookup('service:i18n');
    }
  }),

  /**
   * Translate the text
   *
   * @method i18nTranslate
   * @param {*} [params...]
   * @return {Promise}
   */
  i18nTranslate: function () {
    var node = this.get('i18nKeyNode');
    var args = slice.call(arguments);
    if (node) {
      return node.then(function () {
        return node.get('translateFunction').apply(null, args);
      });
    }
    else {
      return Ember.RSVP.reject('[i18n] The i18n key could not be resolved.');
    }
  }

});
