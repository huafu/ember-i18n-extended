import Ember from 'ember';
import computed from '../computed';
import resolveKeyPath from '../resolve-key-path';

var hasOwn = Object.prototype.hasOwnProperty;
var filter = Ember.EnumerableUtils.filter;
var fmt = Ember.String.fmt;

/**
 * Finds whether an object has only the given property set
 *
 * @function hasOnly
 * @param {Object} object
 * @param {string} key
 * @return {boolean}
 */
function hasOnly(object, key) {
  var k, has = false;
  for (k in object) {
    if (k === key) {
      has = true;
    }
  }
  return has;
}

var FORBIDDEN_PROPERTIES = ['_super'];

/**
 * @class I18nTreeNode
 * @extend Ember.Object
 * @uses Ember.PromiseProxyMixin
 */
var I18nTreeNode = Ember.Object.extend(Ember.PromiseProxyMixin, {
  /**
   * @inheritDoc
   */
  concatenatedProperties: ['forbiddenProperties'],

  /**
   * Our content
   * @property content
   * @type {*}
   */
  content: undefined,

  /**
   * Our children
   * @property children
   * @type {Ember.Array.<I18nTreeNode>}
   */
  children: computed.ro(function () {
    return Ember.A([]);
  }),

  /**
   * Resolve a path, as in linked properties or merged properties
   *
   * @method resolvePath
   * @param {string} path
   * @param {boolean} [returnPath=false]
   * @param {{[root]: boolean|string, [parent]: boolean|string, [dot]: boolean, [ref]: string}} [options]
   * @return {string|I18nTreeNode}
   */
  resolvePath: function (path, returnPath, options) {
    path = resolveKeyPath(path, Ember.merge({root: true, dot: true, parent: true}, options)).path;
    return returnPath ? path : this.get(path);
  },

  /**
   * Name of the property to use as a base to extend from
   * @property extendWithPropertyName
   * @type {string}
   */
  extendWithPropertyName: null,

  /**
   * The name of the property to use as a link to another node
   * @property linkToPropertyName
   * @type {string}
   */
  linkToPropertyName: null,

  /**
   * The forbidden properties
   * @property forbiddenProperties
   * @type {Array}
   */
  forbiddenProperties: FORBIDDEN_PROPERTIES,

  /**
   * The class of our children
   * @property childClass
   * @type {subclass of I18nTreeNode}
   */
  childClass: computed.overridable(function () {
    return I18nTreeNode;
  }),

  /**
   * Create a child node of this node
   *
   * @method createChildNode
   * @param {{nodeName: string, [parentNode]: I18nTreeNode}} options
   * @return {I18nTreeNode}
   */
  createChildNode: function (options) {
    return this.get('childClass').create(options);
  },


  /**
   * Is given string a valid name for one of our properties
   *
   * @method isValidPropertyName
   * @param {string} name
   * @return {boolean}
   */
  isValidPropertyName: function (name) {
    return typeof name === 'string' && this.get('forbiddenProperties').indexOf(name) === -1;
  },

  /**
   * Our parent node
   * @property parentNode
   * @type {I18nTreeNode}
   */
  parentNode: null,

  /**
   * Root node
   * @property rootNode
   * @type {I18nTreeNode}
   */
  rootNode: computed.ro('parentNode.rootNode', 'parentNode', function () {
    var parentNode = this.get('parentNode');
    return parentNode ? parentNode.get('rootNode') : this;
  }),


  /**
   * The path of this node
   * @property nodePath
   * @type {string}
   */
  nodePath: computed.ro('parentNode.nodePath', 'parentNode.nodeName', function () {
    var parentNode = this.get('parentNode');
    if (parentNode) {
      return filter([parentNode.get('nodePath'), parentNode.get('nodeName')], Boolean).join('.') || null;
    }
    else {
      return null;
    }
  }),

  /**
   * Full path to the node
   * @property nodeFullPath
   * @type {string}
   */
  nodeFullPath: computed.ro('nodePath', 'nodeName', function () {
    return filter([this.get('nodePath'), this.get('nodeName')], Boolean).join('.');
  }),

  /**
   * Our node name
   * @property nodeName
   * @type {string}
   */
  nodeName: computed(function (key, value, oldValue) {
    var parentNode = this.get('parentNode');
    if (arguments.length > 1) {
      if (oldValue) {
        throw new Error(fmt(
          '[i18n] Can\'t reset `nodeName` for node `%@` at `%@`.',
          oldValue, this.get('nodePath')
        ));
      }
      if (parentNode && !parentNode.isValidPropertyName(value)) {
        throw new Error(fmt(
          '[i18n] Invalid `nodeName` `%@` at `%@`.',
          value, this.get('nodePath')
        ));
      }
    }
    else {
      if (parentNode) {
        throw new Error(fmt(
          '[i18n] Got a node with no `nodeName` at `%@`.',
          this.get('nodePath')
        ));
      }
    }
    return value;
  }),

  /**
   * The node to go if the content failed to resolve
   * @property fallbackNodePath
   * @type {string}
   */
  fallbackNodePath: null,

  /**
   * Our node value
   * @property nodeValue
   * @type {*}
   */
  nodeValue: computed.ro('content', 'isFulfilled', function () {
    if (this.get('isFulfilled')) {
      return this.get('content');
    }
    else {
      // trigger the load
      this.get('promise').then(function (data) {
        return data;
      });
    }
  }),

  /**
   * Loads our content
   *
   * @method loadContent
   * @return {Promise}
   */
  loadContent: function () {
    var _this = this, nodeName, parentPromise;
    // grab the parent's promise
    nodeName = _this.get('nodeName');
    parentPromise = this.get('parentNode');
    return new Ember.RSVP.Promise(function (resolve, reject) {
      parentPromise
        .then(function (content) {
          // be sure to have an object
          if (!content || typeof content !== 'object' || !hasOwn.call(content, nodeName)) {
            return Ember.RSVP.reject(new Error(fmt(
              '[i18n] No node `%@` at `%@`.',
              nodeName, _this.get('nodePath')
            )));
          }
          resolve(content[nodeName]);
        })
        .catch(function (reason) {
          // handle the case where we have a fallback path
          var fallback = _this.get('fallbackNodePath');
          if (fallback) {
            resolve(_this.resolvePath(fallback));
          }
          else {
            reject(reason);
          }
        });
    }, fmt("[i18n] node lookup: `%@`", this.get('nodeFullPath')))
      .then(function (content) {
        // try to find out if we are a link or if we need to merge with another node
        var linkToKey = _this.get('linkToPropertyName');
        var extendWithKey = _this.get('extendWithPropertyName');
        var isObject = content && typeof content === 'object';
        if (isObject && hasOnly(content, linkToKey)) {
          // we are a link
          return _this.resolvePath(content[linkToKey]);
        }
        else if (isObject && hasOwn.call(content, extendWithKey)) {
          // we have a merge property
          return _this.resolvePath(content[extendWithKey])
            .then(function (base) {
              var res = Object.create(null);
              Ember.merge(res, base);
              Ember.merge(res, content);
              return res;
            });
        }
        // else that's it, here is our content
        return content;
      });
  },

  /**
   * @inheritDoc
   */
  promise: computed.ro(function () {
    if (!this.loadContent) {
      // there is no need to load anything, we are not async
      return this._super.call(this, 'promise', Ember.RSVP.resolve());
    }
    else {
      // we have a custom loader
      return this._super.call(this, 'promise', this.loadContent());
    }
  }),

  /**
   * @inheritDoc
   */
  unknownProperty: function (key) {
    var node;
    if (!this.isValidPropertyName(key)) {
      throw new Error(fmt(
        '[i18n] Invalid `nodeName` `%@` at `%@`.',
        key, this.get('nodePath')
      ));
    }
    node = this.createChildNode({
      parentNode: this,
      nodeName:   key
    });
    this.get('children').pushObject(node);
    this.set(key, node);
    return node;
  }
});

FORBIDDEN_PROPERTIES.push.apply(FORBIDDEN_PROPERTIES, Ember.keys(I18nTreeNode.proto()));

export default I18nTreeNode;
