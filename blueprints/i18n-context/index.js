var helpers = require('../../lib/helpers');

module.exports = {
  description: 'Generates a i18n context data file for the given locale.',

  availableOptions: [
    {
      name:    'locale',
      type:    String,
      default: helpers.DEV_LOCALE
    }
  ],

  locals: function (options) {
    if (!options.locale) {
      options.locale = helpers.DEV_LOCALE;
    }
    if (!helpers.isValidLocale(options.locale)) {
      throw new ReferenceError('Invalid locale `' + options.locale + '`.');
    }
    return {locale: options.locale};
  },

  fileMapTokens: function () {
    return {
      __locale__: function (options) {
        return options.locals.locale;
      },

      __i18n_folder__: function () {
        return helpers.I18N_DIR;
      },

      __context_name__: function(options){
        return options.dasherizedModuleName.replace(/[\/-]/g, '_');
      }
    };
  }
};
