import Ember from 'ember';
import computed from './computed';

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
  })
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
        ctrl.set('i18nDefaultContext', this.routeName || this.controllerName);
      }
    }
  }
});

Ember.Router.reopen({
  i18nExtendedDidTransition: Ember.on('didTransition', function () {
    this.send('i18nExtendedSetupDefaultContext');
  })
});
