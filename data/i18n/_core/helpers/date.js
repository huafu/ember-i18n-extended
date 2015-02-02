import Ember from 'ember';

export default function (date, format) {
  if (date === 'now') {
    date = new Date();
  }
  else if (!(date instanceof Date)) {
    Ember.warn('[i18n] Invalid date given for `date` helper: `' + date + '`.');
    return '';
  }
  format = format || this.config.defaultDateFormat;
  return this._icu.getDateFormat(format).format(date);
}
