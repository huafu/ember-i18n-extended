/* globals require */
import Ember from 'ember';
import computed from '../computed';
import I18nTreeNode from './node';
import I18nTreeKeyNode from './key-node';

/**
 * @class I18nTreeContextNode
 * @extends I18nTreeNode
 */
export default I18nTreeNode.extend({
  /**
   * @inheritDoc
   */
  forbiddenProperties: ['service', 'locale', 'url', 'modulePath', 'context'],

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
    Ember.merge(options, this.getProperties('service', 'locale'));
    options.context = this;
    return this._super(options);
  },

  /**
   * Point to this context for easier resolving of paths
   * @property context
   * @type {I18nTreeContextNode}
   */
  context: computed.readOnly(''), // trick to point on the same object

  /**
   * Our locale
   * @property locale
   * @type {I18nTreeLocaleNode}
   */
  locale: computed.readOnly('parentNode'),

  /**
   * Our i18n service
   * @property service
   * @type {I18nService}
   */
  service: computed.readOnly('parentNode.service'),

  /**
   * Our module path
   * @property modulePath
   * @type {string}
   */
  modulePath: computed.ro('locale.modulePath', 'nodeName', function () {
    return this.get('locale.modulePath') + '/' + this.get('nodeName');
  }),

  /**
   * URL of our file if it is not bundled
   * @property url
   * @type {string}
   */
  url: computed.ro('locale.baseUrl', 'nodeName', function () {
    return this.get('locale.baseUrl') + '/' + this.get('nodeName') + '.js';
  }),

  /**
   * @inheritDoc
   */
  loadContent: function () {
    var _this = this;
    // and return our promise
    return new Ember.RSVP.Promise(function (resolve, reject) {
      var modulePath, contextNotFound;
      // to be called when the context is not found
      contextNotFound = Ember.run.bind(null, function () {
        Ember.warn(
          '[i18n] Context `' + _this.get('nodeName') + '` not found for locale `' +
          _this.get('locale.code') + '`. ' +
          'This could happen if you forgot to prepend a full path to a key with `/` in one of your template, ' +
          'or if you yet didn\'t set that key in the appropriate i18n context file.'
        );
        reject('[i18n] Context `' + _this.get('nodeName') + '` not found for locale `' + _this.get('locale.code') + '`.');
      });
      // load the data locally or remotely (whether the locale is bundled or not)
      if (_this.get('locale.isBundled')) {
        // it is bundled, try to require it if it exists
        modulePath = _this.get('modulePath');
        if (require.entries[modulePath]) {
          resolve(require(modulePath)['default']);
        }
        else {
          contextNotFound();
        }
      }
      else {
        // it is not bundled, we need to download it
        Ember.$.get(_this.get('url'), null, null, 'text')
          .done(Ember.run.bind(null, function (data) {
            resolve((new Function(data.replace(/^\s*export\s+default\s+/m, 'return ')))());
          }))
          .fail(contextNotFound);
      }
    });
  }

});
