import Ember from 'ember';
import computed from './computed';

var snake = Ember.underscore;

export default Ember.Object.extend({
  /**
   * The i18n key
   * @property key
   * @type {string}
   */
  key: null,

  /**
   * The fixed context from the controller
   * @property fixedContext
   * @type {string}
   */
  fixedContext: computed.overridableAny(
    'controller.i18nContext', 'targetObject.i18nContext'
  ),

  /**
   * The default context from the controller
   * @property defaultContext
   * @type {string}
   */
  defaultContext: computed.overridableAny(
    'controller.i18nDefaultContext', 'targetObject.i18nDefaultContext'
  ),

  /**
   * Possible context keys to use, in order
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
      res = ['/' + snake(def) + '.' + key];
    }
    else {
      // try to prepend each part of the route
      res = [];
      def = this.get('defaultContext');
      if (def) {
        def = snake(def);
        parts = def.split('.');
        while (parts.length) {
          res.push('/' + parts.join('.') + '.' + key);
          parts.pop();
        }
      }
      // from common context?
      res.push('/' + this.get('i18n.commonContextName') + '.' + key);
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
  i18n: computed.overridable(function () {
    return this.i18nService || this.container.lookup('service:i18n');
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
  })
});
