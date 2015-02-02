import Ember from 'ember';
import ENV from '../../config/environment';
import I18nContext from './context';
import computed from './computed';


/**
 * @class I18nLocale
 * @extends Ember.Object
 */
export default Ember.Object.extend({
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
  code: null,

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
  }),


  /**
   * All contexts
   * @property contexts
   * @type {Ember.Object}
   */
  contexts: computed.ro(function () {
    var locale = this;
    return Ember.Object.extend({
      unknownProperty: function (name) {
        var context = I18nContext.create({locale: locale, name: name});
        this.set(name, context);
        return context;
      }
    }).create({});
  })

});
