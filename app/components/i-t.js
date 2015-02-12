import Ember from 'ember';
import computed from '../libs/i18n/computed';
import I18nWithI18bKeyMixin from '../mixins/i18n/with-i18n-key';


/**
 * @class I18nTranslationComponent
 * @alias ITComponent
 * @extends Ember.Component
 *
 * @property {I18nService} i18nService
 */
export default Ember.Component.extend(I18nWithI18bKeyMixin, {
  /**
   * @inheritDoc
   */
  tagName: 'span',

  /**
   * We have to use the layout and provide and empty template so that using the helper will
   * allow to use the template without deprecation warning
   * @inheritDoc
   */
  layoutName: 'i18n/components/i-t',

  /**
   * The i18n key
   * @property key
   * @type {string}
   */
  key: null,

  /**
   * @inheritDoc
   */
  i18nKey: computed.oneWay('key'),

  /**
   * The parameters
   * @property params
   * @type {Array}
   */
  params: computed('helperName', function (key, value) {
    var res, i, param;
    if (arguments.length > 1) {
      return value || [];
    }
    else {
      // this is only in the case we are used directly as a component
      res = [];
      i = 1;
      do {
        param = this.get('p' + i);
        i++;
      } while (param !== undefined && res.push(param));
      return res;
    }
  }),

  /**
   * Resolved parameters when coming from the `t` helper
   * @property resolvedParams
   * @type {Array}
   */
  resolvedParams: computed.ro('params', function () {
    var i, params = this.get('params'), resolved, param;
    if (!this.get('helperName')) {
      return params;
    }
    resolved = [];
    for (i = 0; i < params.length; i++) {
      param = params[i];
      // TODO: use Ember Stream, but it is not yet exposed
      if (param && param.isStream === true) {
        param = param.value();
      }
      resolved.push(param);
    }
    return resolved;
  }),


  /**
   * The resolved translation
   * @property translation
   * @type {string}
   */
  translation: computed.ro('i18nTranslateFunction', 'resolvedParams.@each', function () {
    var translateFunction, params;
    translateFunction = this.get('i18nTranslateFunction');
    params = this.get('resolvedParams');
    if (translateFunction) {
      return translateFunction.apply(null, params);
    }
  }),

  /**
   * The fixed context from the controller
   * @property i18nFixedContext
   * @type {string}
   */
  i18nFixedContext: computed.oneWay('targetObject.i18nContext'),

  /**
   * The default context from the controller
   * @property i18nDefaultContext
   * @type {string}
   */
  i18nDefaultContext: computed.oneWay('targetObject.i18nDefaultContext')
});
