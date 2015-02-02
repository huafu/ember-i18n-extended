import Ember from 'ember';
import computed from '../libs/i18n/computed';

/**
 * @class I18nLanguageSelectComponent
 * @extends Ember.Component
 *
 * @property {I18nService} i18nService
 */
export default Ember.Component.extend({
  /**
   * @inheritDoc
   */
  classNames: ['i18n-language-select'],

  /**
   * List of languages
   * @property languages
   * @type {Ember.Array.<{code: string, name: string}>}
   */
  languages: computed.readOnly('i18nService.nativeLanguages'),

  /**
   * The currently selected locale
   * @property selectedLocale
   * @type {string}
   */
  locale: computed.alias('i18nService.currentLocale')
});
