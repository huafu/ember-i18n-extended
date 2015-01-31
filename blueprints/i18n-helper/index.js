var helpers = require('../../lib/helpers');

module.exports = {
  description: 'Generates a i18n helper for use within translations.',

  fileMapTokens: function () {
    return {
      __i18n_folder__: function () {
        return helpers.I18N_DIR;
      }
    };
  }
};
