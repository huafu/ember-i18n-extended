import Ember from 'ember';

export default function (number, decimals) {
  if (number == null || isNaN(number)) {
    Ember.warn('[i18n] Invalid number given for `float` helper: `' + number + '`.');
    return '';
  }
  if (decimals == null) {
    decimals = 2;
  }
  return this._icu.getDecimalFormat(decimals).format(number);
}
