import Ember from 'ember';
import computed from './computed';
import I18nComputedProperty from './computed-property';

var slice = Array.prototype.slice;
var map = Ember.EnumerableUtils.map;
var fmt = Ember.String.fmt;
var snake = Ember.String.underscore;

/**
 * Create a computed key that will return the translation of the given key and parameters.
 * Each parameter must be a path to a property as defined in computed properties.
 * The object owning the computed property must have a container set so that this utility can find
 * the i18n service.
 *
 * @param {string} key The i18n key
 * @param {string} [pathToArgument...]
 * @return {Ember.ComputedProperty}
 */
Ember.computed.translated = function (key/*, arg1, arg2*/) {
  var args = slice.call(arguments, 1);
  var name = key.replace(/\./g, 'T');
  // create our computed property
  return Ember.computed.apply(null, args.concat([
    '_i18nComputedTranslated.' + name + '.i18nTranslateFunction',
    function () {
      var translate, collectedArgs, owner;
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
        this._i18nComputedTranslated[name] =
          I18nComputedProperty.create({
            owner:     this,
            i18nKey:   key,
            container: this.container
          });
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

Ember.Controller.reopen({
  /**
   * Our default context
   * @property i18nDefaultContext
   * @type {string}
   */
  i18nDefaultContext: null,

  /**
   * The i18n context
   * @property i18nContext
   * @type {string}
   */
  i18nContext: computed.overridable('parentController.i18nContext', function () {
    return this.get('parentController.i18nContext');
  }),

  /**
   * The object to use to get translation nodes
   * @property i18n
   * @type {I18nTreeLocaleNode}
   */
  i18n: computed.ro('i18nDefaultContext', 'i18nContext', 'i18nService.localeNode', function(){
    var node = this.get('i18nService.localeNode'), context = this.get('i18nContext')||this.get('i18nDefaultContext');
    if(context){
      node = node.get(context);
    }
    return node;
  })

});

Ember.View.reopen({
  /**
   * Get our default context from our controller if any
   * @property i18nDefaultContext
   * @type {string}
   */
  i18nDefaultContext: computed.oneWay('controller.i18nDefaultContext'),
  /**
   * Get our context from our controller if any
   * @property i18nContext
   * @type {string}
   */
  i18nContext: computed.oneWay('controller.i18nContext')
});


/**
 * @class I18nExtendedRouteOverrides
 * @extension I18nExtendedRouteOverrides
 * @extends Ember.Route
 */
Ember.Route.reopen({
  _actions: {
    /**
     * Set the controller's i18n context as this route name if not yet set
     *
     * @method i18nExtendedSetupDefaultContext
     */
    i18nExtendedSetupDefaultContext: function () {
      var ctrl = this.controllerFor(this.controllerName || this.routeName);
      if (!ctrl.get('i18nDefaultContext')) {
        ctrl.set('i18nDefaultContext', snake(this.routeName || this.controllerName));
      }
    }
  }
});

Ember.Router.reopen({
  i18nExtendedDidTransition: Ember.on('didTransition', function () {
    this.send('i18nExtendedSetupDefaultContext');
  })
});
