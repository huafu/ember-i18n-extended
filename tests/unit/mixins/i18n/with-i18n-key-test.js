import Ember from 'ember';
import I18nWithI18nKeyMixin from 'ember-i18n-extended/mixins/i18n/with-i18n-key';

module('I18nWithI18nKeyMixin');

// Replace this with your real tests.
test('it works', function() {
  var I18nWithI18nKeyObject = Ember.Object.extend(I18nWithI18nKeyMixin);
  var subject = I18nWithI18nKeyObject.create();
  ok(subject);
});
