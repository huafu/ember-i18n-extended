import Ember from 'ember';

export default function (int) {
  if (int == null || isNaN(int)) {
    Ember.warn('[i18n] Invalid number given for `int` helper: `' + int + '`.');
    return '';
  }
  return this._icu.getIntegerFormat().format(int);
}
