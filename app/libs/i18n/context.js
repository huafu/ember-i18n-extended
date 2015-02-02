/* globals require */
import Ember from 'ember';
import computed from './computed';
import I18nContextNode from './context-node';

/**
 * @class I18nContext
 * @extends Ember.Object
 */
export default Ember.Object.extend({
  /**
   * Our locale
   * @property locale
   * @type {I18nLocale}
   */
  locale: null,

  /**
   * Our i18n service
   * @property service
   * @type {I18nService}
   */
  service: computed.readOnly('locale.service'),

  /**
   * Is our data loaded
   * @property isLoaded
   * @type {boolean}
   */
  isLoaded: computed.bool('keys'),

  /**
   * The load occurred but no data or got a not found
   * @property isError
   * @type {boolean}
   */
  isError: false,

  /**
   * Is our data loading
   * @property isLoading
   * @type {boolean}
   */
  isLoading: false,

  /**
   * Our module path
   * @property modulePath
   * @type {string}
   */
  modulePath: computed.ro('locale.modulePath', 'name', function () {
    return this.get('locale.modulePath') + '/' + this.get('name');
  }),

  /**
   * URL of our file if it is not bundled
   * @property url
   * @type {string}
   */
  url: computed.ro('locale.baseUrl', 'name', function () {
    return this.get('locale.baseUrl') + '/' + this.get('name') + '.js';
  }),

  /**
   * All our keys and sub-keys
   * @property keys
   * @type {Object}
   */
  keys: computed(function (key, value) {
    if (arguments.length > 1) {
      // it's a set, we need to compile it
      Ember.run.next(this.get('service'), 'trigger', 'didLoadContext', this);
      if (value) {
        return I18nContextNode.create({
          nodeContext: this,
          nodeLocale:  this.get('locale'),
          nodeValue: value
        });
      }
      else {
        return null;
      }
    }
    else {
      // it's a get, we need to load our data
      Ember.run.once(this, 'load');
    }
  }),

  /**
   * Load our data if it is not loaded yet
   *
   * @method load
   */
  load: function () {
    var modulePath, contextNotFound;
    if (this.get('isLoading') || this.get('isLoaded')) {
      return;
    }

    // to be called when the context is not found
    contextNotFound = Ember.run.bind(this, function () {
      Ember.warn(
        '[i18n] Context `' + this.get('name') + '` not found for locale `' +
        this.get('locale.code') + '`. '+
        'This could happen if you forgot to prepend a full path to a key with `/` in one of your template, '+
          'or if you yet didn\'t set that key in the appropriate i18n context file.'
      );
      this.setProperties({
        isLoading: false,
        keys:      null,
        isError:   true
      });
    });

    // fire our willLoadContext event
    this.get('service').trigger('willLoadContext', this);
    this.set('isLoading', true);

    if (this.get('locale.isBundled')) {
      // it is bundled, try to require it if it exists
      modulePath = this.get('modulePath');
      if (require.entries[modulePath]) {
        this.setProperties({
          isLoading: false,
          keys:      require(modulePath)['default']
        });
      }
      else {
        contextNotFound();
      }
    }
    else {
      // it is not bundled, we need to download it
      Ember.$.get(this.get('url'), null, null, 'text')
        .done(Ember.run.bind(this, function (data) {
          this.setProperties({
            isLoading: false,
            keys:      (new Function(data.replace(/^\s*export\s+default\s+/m, 'return ')))()
          });
        }))
        .fail(contextNotFound);
    }
  }

});
