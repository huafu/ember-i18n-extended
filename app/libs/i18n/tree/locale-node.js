import Ember from 'ember';
import ENV from '../../../config/environment';
import I18nTreeNode from './node';
import I18nTreeContextNode from './context-node';

import computed from '../computed';


/**
 * @class I18nTreeLocaleNode
 * @extends I18nTreeNode
 */
export default I18nTreeNode.extend({
  /**
   * @inheritDoc
   */
  forbiddenProperties: ['service', 'code', 'helpers', 'modulePath', 'baseUrl', 'isBundled'],

  /**
   * Our children are I18nTreeContextNode
   * @property childClass
   * @type {subclass of I18nTreeNode}
   */
  childClass: computed.overridable(function () {
    return I18nTreeContextNode;
  }),

  /**
   * @inheritDoc
   */
  loadContent: null, // we do not need to load anything

  /**
   * Our service
   * @property service
   * @type {I18nService}
   */
  service: null,

  /**
   * Code of the locale
   * @property code
   * @type {string}
   */
  code: computed.readOnly('nodeName'),

  /**
   * Helpers
   * @property helpers
   * @type {Object}
   */
  helpers: computed.ro('code', 'service.helpers', function () {
    var self = this.get('service.helpers.' + this.get('code')),
      base = this.get('service.helpers._base'), res = Object.create(null);
    Ember.merge(res, base);
    Ember.merge(res, self);
    return res;
  }),

  /**
   * Path to the module version
   * @property modulePath
   * @type {string}
   */
  modulePath: computed.ro('code', 'service.dataFilesPath', function () {
    return ENV.modulePrefix + '/' + this.get('service.dataFilesPath') + '/' + this.get('code');
  }),

  /**
   * The base URL for this locale
   * @property baseUrl
   * @type {string}
   */
  baseUrl: computed.ro('code', 'service.dataFilesPath', function () {
    return ENV.baseURL + this.get('service.dataFilesPath') + '/' + this.get('code');
  }),

  /**
   * Is this locale bundled into the app?
   * @property isBundled
   * @type {boolean}
   */
  isBundled: computed.ro('code', 'service.bundledLocales', function () {
    return this.get('service.bundledLocales').contains(this.get('code'));
  })
});
