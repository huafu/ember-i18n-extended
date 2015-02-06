var helpers = require('../../lib/helpers');
var SilentError = require('../../node_modules/ember-cli/lib/errors/silent');

function checkLocale(options) {
  if (options.locale && !helpers.isValidLocale(options.locale)) {
    throw new SilentError('Invalid locale `' + options.locale + '`.');
  }
}

module.exports = {
  description: 'Generates a i18n context data file for the given locale.',

  availableOptions: [
    {
      name:    'locale',
      type:    String,
      default: helpers.DEV_LOCALE
    }
  ],

  beforeInstall: checkLocale,

  beforeUninstall: checkLocale,

  locals: function (options) {
    return {
      locale:  options.locale || helpers.DEV_LOCALE,
      context: helpers.cleanupKeySegment(options.entity.name)
    };
  },

  fileMapTokens: function () {
    return {
      __locale__: function (options) {
        return options.locals.locale;
      },

      __i18n_folder__: function () {
        return helpers.I18N_DIR;
      },

      __context_name__: function (options) {
        return options.locals.context;
      }
    };
  }
};
