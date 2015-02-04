import Ember from 'ember';
import computed from './computed';
import I18nWithI18bKeyMixin from '../../mixins/i18n/with-i18n-key';

export default Ember.Object.extend(I18nWithI18bKeyMixin, {
  /**
   * Our owner object
   * @property owner
   * @type {Ember.View}
   */
  owner: null,

  /**
   * @inheritDoc
   */
  i18nFixedContext: computed.readOnly('owner.i18nContext'),

  /**
   * @inheritDoc
   */
  i18nDefaultContext: computed.readOnly('owner.i18nDefaultContext'),

  /**
   * @inheritDoc
   */
  init: function () {
    this._super.apply(this, arguments);
    Ember.on(this.get('owner'), 'destroy', this, 'destroy');
  }
});

