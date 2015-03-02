import Ember from 'ember';
import computed from './computed';
import I18nComputedProperty from './computed-property';

import {UNDEFINED_CONTEXT} from '../../services/i18n';

var slice = Array.prototype.slice;
var map = Ember.EnumerableUtils.map;
var forEach = Ember.EnumerableUtils.forEach;
var fmt = Ember.String.fmt;
var snake = Ember.String.underscore;

var WithI18nMixin;

/**
 * Create a computed key that will return the translation of the given key and parameters.
 * Each parameter must be a path to a property as defined in computed properties.
 * The object owning the computed property must have a container set so that this utility can find
 * the i18n service.
 *
 * @param {boolean} [keyIsPath=false] Whether the given key is a path to a property holding the key or the key itself
 * @param {string} key The i18n key
 * @param {string} [pathToArgument...]
 * @return {Ember.ComputedProperty}
 */
Ember.computed.translated = function (/*key, arg1, arg2*/) {
  var args, name, keyIsPath, key;
  args = slice.call(arguments);
  keyIsPath = (typeof args[0] === 'boolean') ? args.shift() : false;
  key = args.shift();
  name = (keyIsPath ? 'P' : 'K') + '$' + key.replace(/\./g, 'T');
  // create our computed property
  return Ember.computed.apply(null, args.concat([
    '_i18nComputedTranslated.' + name + '.i18nTranslateFunction',
    function () {
      var translate, collectedArgs, owner, object;
      // create the container if it does not exist
      if (!this._i18nComputedTranslated) {
        if (!this.container || !(this.container instanceof Ember.Container)) {
          throw new Error(fmt(
            '[i18n] `Ember.computed.translated` must be used on an object having' +
            ' the application container set on the `container` property (defined in `%@` for i18n key `%@`).',
            this, key
          ));
        }
        this._i18nComputedTranslated = Object.create(null);
      }
      // create our required object after extending it
      if (!this._i18nComputedTranslated[name]) {
        this._i18nComputedTranslated[name] = object =
          I18nComputedProperty.create({
            owner:     this,
            i18nKey:   keyIsPath ? key : null,
            container: this.container
          });
        // it's a path to a key and not directly the key, bind it
        if (keyIsPath) {
          Ember.bind(object, 'i18nKey', 'owner.' + key);
        }
      }
      // finally return the data from our created object
      translate = this._i18nComputedTranslated[name].get('i18nTranslateFunction');
      if (translate) {
        owner = this;
        collectedArgs = map(args, function (name) {
          return owner.get(name);
        });
        return translate.apply(null, collectedArgs);
      }
    }
  ]));
};

WithI18nMixin = Ember.Mixin.create({
  /**
   * The i18nContext from the current route
   * @property i18nDefaultContext
   * @type {string}
   */
  i18nDefaultContext: Ember.required(),

  /**
   * The i18n fixed context
   * @property i18nContext
   * @type {string}
   */
  i18nContext: Ember.required(),

  /**
   * The i18n resolved context
   * @property i18nResolvedContext
   * @type {string}
   */
  i18nResolvedContext: computed('i18nDefaultContext', 'i18nContext', function () {
    return this.get('i18nContext') || this.get('i18nDefaultContext') || UNDEFINED_CONTEXT;
  }),

  /**
   * The object to use to get translation nodes
   * @property i18n
   * @type {I18nTreeLocaleNode}
   */
  i18n: computed.ro('i18nResolvedContext', 'i18nService.localeNode', function () {
    var node = this.get('i18nService.localeNode'), context = this.get('i18nResolvedContext');
    return node ? node.get(context) : null;
  })
});

Ember.ControllerMixin.reopen(WithI18nMixin, {
  /**
   * @inheritDoc
   */
  i18nDefaultContext: computed.oneWay('parentController.i18nDefaultContext'),

  /**
   * @inheritDoc
   */
  i18nContext: computed.oneWay('parentController.i18nContext')
});

Ember.Component.reopen(WithI18nMixin, {
  /**
   * @inheritDoc
   */
  i18nDefaultContext: computed.oneWay('targetObject.i18nDefaultContext'),

  /**
   * @inheritDoc
   */
  i18nContext: computed.oneWay('targetObject.i18nContext')
});


Ember.View.reopen(WithI18nMixin, {
  /**
   * @inheritDoc
   */
  i18nDefaultContext: computed.oneWay('controller.i18nDefaultContext'),

  /**
   * @inheritDoc
   */
  i18nContext: computed.oneWay('controller.i18nContext')
});


Ember.Router.reopen({
  i18nExtendedDidTransition: Ember.on('didTransition', function () {
    var handlerInfos = this.router.currentHandlerInfos.slice();
    handlerInfos.reverse();
    forEach(handlerInfos, function (handler) {
      var controller, name;
      name = handler.name;
      controller = handler.handler.controller;
      if (controller && !controller.cacheFor('i18nDefaultContext')) {
        controller.set('i18nDefaultContext', snake(name));
      }
    });
  })
});
