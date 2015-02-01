import Ember from 'ember';
import computed from './computed';
import translatePath from './translate-path';
import isValidKey from './is-valid-key';
import isLink from './is-link';
import compileTranslation from './compile-translation';


var I18nContextNode;

/**
 * @class I18nContextNode
 * @extends Ember.Object
 */
I18nContextNode = Ember.Object.extend({
  /**
   * Our context
   * @property nodeContext
   * @type {I18nContext}
   */
  nodeContext: null,

  /**
   * The locale for this node
   * @property nodeLocale
   * @type {I18nLocale}
   */
  nodeLocale: null,

  /**
   * Parent context node
   * @property parentNode
   * @type {I18nContextNode}
   */
  parentNode: null,

  /**
   * Key of this node
   * @property nodeName
   * @type {string}
   */
  nodeName: null,

  /**
   * Raw data as it comes from the i18n file
   * @property nodeValue
   * @type {*}
   */
  nodeValue: null,

  /**
   * Linked node
   * @property linkedNodePath
   * @type {string}
   */
  linkedNodePath: computed.ro('nodeValue', function () {
    var val = this.get('nodeValue');
    if (val && val.$) {
      return translatePath(val.$);
    }
  }),

  /**
   * The dynamic keys
   * @property dynamicKeys
   * @type {Object}
   */
  dynamicKeys: computed.ro(function () {
    return Object.create(null);
  }),


  /**
   * The full path to our node
   * @property nodePath
   * @type {string}
   */
  nodePath: computed.ro('nodeLocale', 'nodeContext', 'parentNode', 'nodeName', function () {
    var hash = this.getProperties('nodeLocale', 'nodeContext', 'parentNode', 'nodeName');
    if (hash.parentNode) {
      return hash.parentNode.get('nodePath') + '.' + hash.nodeName;
    }
    else {
      return hash.nodeLocale.get('code') + '.' + hash.nodeContext.get('name');
    }
  }),

  /**
   * @inheritDoc
   */
  unknownProperty: function (key) {
    var val, obj, linkedPath, props, res;
    if (isValidKey(key)) {
      obj = this.get('nodeValue');
      if (obj) {
        if (obj[key]) {
          val = obj[key];
          if (typeof val === 'string') {
            // static string
            res = compileTranslation(this, key, val);
            if (res instanceof Error) {
              Ember.warn(
                '[i18n] Error compiling key `' + this.get('nodePath') + '.' + key +
                '`: ' + res.message + '.'
              );
              res = null;
            }
            else if (res && res.i18nDynamic) {
              this.set('dynamicKeys.' + key, res);
              Ember.oneWay(this, key, 'dynamicKeys.' + key + '.translateFunction');
              // we do not want to cache
              return this.get(key);
            }// if res instanceof Error
          }
          else if (typeof val === 'function') {
            // function
            res = val;
          }
          else if (typeof val === 'object') {
            if (isLink(val)) {
              linkedPath = translatePath(val.$);
              if (linkedPath) {
                // creates a new one way binding to our linked path and return so that it won't be set
                Ember.oneWay(this, key, linkedPath);
                return this.get(key);
              }
              else {
                // log it as wrong linked path
                Ember.warn(
                  '[i18n] Wrong link path `' + val.$ + '` (defined at `' +
                  this.get('nodePath') + '.' + key + '`).'
                );
                res = null;
              }
            }
            else {
              props = this.getProperties('nodeContext', 'nodeLocale');
              props.parentNode = this;
              props.nodeValue = val;
              props.nodeName = key;
              res = I18nContextNode.create(props);
            }
          }
          else {
            // wrong type of data
            Ember.warn(
              '[i18n] Wrong type of value for the translation key `' +
              this.get('nodePath') + '.' + key + '`.'
            );
            res = null;
          } // type switch
        } //if obj[key]
        else if (obj.$) {
          // we do not have this key, but we are merged with another one so bind to it
          linkedPath = translatePath(obj.$, this, '$');
          if (linkedPath) {
            // creates a new one way binding to our linked path and return so that it won't be set
            Ember.oneWay(this, key, linkedPath + '.' + key);
            return this.get(key);
          }
          else {
            // log it as wrong linked path
            Ember.warn(
              '[i18n] Wrong merge path `' + val + '` (defined at `' +
              this.get('nodePath') + '.$`).'
            );
            res = null;
          } // if linkedPath
        } // if obj[key]
      } // if obj
    } // if isValidKey
    else {
      // invalid key
      Ember.warn(
        '[i18n] Wrong key in `' + this.get('nodePath') + '`: `' + key +
        '`. Keys must be lowercase and containing only letters, numbers, `$` or `_`.'
      );
      res = null;
    } // if valid key
    // save so that it is cached and return
    this.set(key, res);
    return res;
  }

});

export default I18nContextNode;
