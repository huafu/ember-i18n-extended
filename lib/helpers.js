var RSVP = require('rsvp');
var mkdirp = require('mkdirp');
var http = require('http');
var sysPath = require('path');
var fs = require('fs');
var self;

/**
 * @class Locale
 * @param {string} code
 * @param {string} path
 * @constructor
 */
function Locale(code, path) {
  this.code = code;
  this.path = path;
}

Locale.prototype.toString = function () {
  return this.code;
};

Locale.prototype.valueOf = function () {
  return this.code;
};

/**
 * @class File
 * @param {{url: string, path: string, [root]: string, [prepend]: string, [append]: string}} options
 * @constructor
 */
function File(options) {
  this.path = options.path;
  this.url = options.url;
  this.prepend = options.prepend || 'export default';
  this.append = options.append || ';';
  this.root = options.root;
}

/**
 * @inheritDoc
 */
File.prototype.toString = function () {
  return self.normalizePath(this.path);
};

/**
 * Get a new file object for the given options
 *
 * @param {Object} [overrides=null]
 * @return {File}
 */
File.prototype.clone = function (overrides) {
  var res = new File(this);
  if (overrides) {
    ['root', 'path', 'url', 'append', 'prepend'].forEach(function (key) {
      if (overrides.hasOwnProperty(key)) {
        res[key] = overrides[key];
      }
    });
  }
  return res;
};

/**
 * Full path to the file
 *
 * @param {string} [root=this.root]
 * @param {Object} [vars=null]
 * @param {string} [path=this.path]
 * @return {string}
 */
File.prototype.fullPath = function (root, vars, path) {
  var fullPath = sysPath.join(root || this.root, self.normalizePath(path || this.path));
  if (vars) {
    fullPath = fullPath.replace(/\{([^}]+)}/g, function (dummy, key) {
      return '' + vars[key];
    });
  }
  return sysPath.resolve(fullPath);
};

/**
 * Whether the file exists or not
 *
 * @param {string} [root=this.root]
 * @param {Object} [vars=null]
 * @param {string} [path=this.path]
 * @return {boolean}
 */
File.prototype.exists = function (root, vars, path) {
  return fs.existsSync(this.fullPath(root, vars, path));
};

/**
 * Get the URL completed with given vars if any
 *
 * @param {Object} [vars=null]
 * @return {string}
 */
File.prototype.urlFor = function (vars) {
  var url = this.url;
  if (vars) {
    url = url.replace(/\{([^}]+)}/g, function (dummy, key) {
      return '' + vars[key];
    });
  }
  return url;
};

/**
 * Downloads the file
 *
 * @param {boolean} [onlyIfMissing=false]
 * @param {Object} [urlVars=null]
 * @param {string} [root=this.root]
 * @param {Object} [pathVars=null]
 * @param {string} [path=this.path]
 * @return {Promise}
 */
File.prototype.download = function (onlyIfMissing, urlVars, root, pathVars, path) {
  var options = {
    url:     this.urlFor(urlVars),
    path:    this.fullPath(root, pathVars, path),
    prepend: this.prepend,
    append:  this.append
  };
  return self.download(options, onlyIfMissing);
};


module.exports = self = {
  I18N_DIR:       'i18n',
  DEV_LOCALE:     'dev',
  SELF_DATA_PATH: sysPath.resolve(__dirname, '..', 'data'),

  FILES: {
    LOCALIZED: {
      LANGUAGE_MAP: new File({
        path: '_core/lang-map.js',
        url:  'http://www.localeplanet.com/api/{locale}/langmap.json'
      }),
      ICU:          new File({
        path:    '_core/icu.js',
        url:     'http://www.localeplanet.com/api/{locale}/icu.js?object=container',
        prepend: 'var container = {};',
        append:  'export default container;'
      }),
      CURRENCY_MAP: new File({
        path: '_core/currency-map.js',
        url:  'http://www.localeplanet.com/api/{locale}/currencymap.json?name=Y'
      })
    },
    COMMON:    {
      LOCALES:      new File({
        path: '_core/locales.js',
        url:  'http://www.localeplanet.com/api/codelist.json'
      }),
      LANGUAGE_MAP: new File({
        path: '_core/lang-map.js',
        url:  'http://www.localeplanet.com/api/auto/langmap.json?native=Y'
      })
    }
  },

  /**
   * Normalize a path
   *
   * @param {string} [part...]
   * @return {string}
   */
  normalizePath: function () {
    var args = Array.prototype.slice.call(arguments);
    return args.filter(Boolean).map(function (part) {
      return part.replace(/\//g, sysPath.sep);
    }).join(sysPath.sep);
  },


  /**
   * Returns a function that resolve or reject
   *
   * @param {Function|null} [resolve]
   * @param {Function|null} [reject]
   * @return {Function}
   */
  resolveOrReject: function (resolve, reject) {
    return function (err, data) {
      return err ? reject(err) : resolve(data);
    };
  },

  /**
   * Returns the path to the `i18n` folder in the given root
   *
   * @param {string} root
   * @param {string} [locale]
   * @return {string}
   */
  i18nPath: function (root, locale) {
    return sysPath.resolve(root, self.I18N_DIR, locale);
  },

  /**
   * Returns the path to the `dev` locale folder in the given root
   *
   * @param {string} root
   * @return {string}
   */
  devLocalePath: function (root) {
    return self.i18nPath(root, self.DEV_LOCALE);
  },

  /**
   * List project locales
   *
   * @param {string} projectRoot
   * @param {{i18n: {enabledLocales: Array}, l10n: {}}|null} config
   * @param {boolean} [warn=false]
   * @param {boolean} [bare=false]
   * @return {Array.<Locale>|Array.<string>}
   */
  listProjectLocales: function (projectRoot, config, warn, bare) {
    var basePath = self.i18nPath(projectRoot), res;
    if (config && config.i18n.enabledLocales) {
      res = config.i18n.enabledLocales.map(function (locale) {
        return bare ? locale : new Locale('' + locale, sysPath.join(basePath, locale));
      });
    }
    else {
      if (!fs.existsSync(basePath)) {
        res = [];
      }
      else {
        res = fs.readdirSync(basePath).filter(function (file) {
          return /^[^_\.]/.test(file) && fs.statSync(sysPath.join(basePath, file)).isDirectory();
        }).map(function (locale) {
          return bare ? locale : new Locale(locale, sysPath.join(basePath, locale));
        });
      }
    }
    return self.filterLocales(res, warn);
  },

  /**
   * Filter an array of locales
   *
   * @param {string|Locale|Array.<string|Locale>} [locale...]
   * @param {boolean} [warn=false]
   * @return {Array.<string|Locale>}
   */
  filterLocales: function () {
    var locales, included, all, warn, args;
    locales = [];
    included = {};
    all = self.allKnownLocales();
    args = Array.prototype.slice.call(arguments);
    if (typeof args[args.length - 1] === 'boolean') {
      warn = args.pop();
    }
    args.forEach(function (locale) {
      if (!(locale instanceof Array)) {
        locale = [locales];
      }
      locales.push.apply(locales, locale);
    });
    return locales.filter(function (locale) {
      var strLocale;
      if (locales) {
        strLocale = '' + locale;
        if (!included.hasOwnProperty(strLocale)) {
          included[strLocale] = 0;
          if (strLocale === self.DEV_LOCALE || all.indexOf(strLocale) !== -1) {
            return true;
          }
          else if (warn) {
            console.warn('[i18n] Unknown locale `' + strLocale + '`, ignoring it.');
          }
        }
      }
      return false;
    });
  },

  /**
   * Grab all missing files
   *
   * @param {string} root
   * @param {Object} config
   * @return {Promise}
   */
  grabMissingFiles: function (root, config) {
    return new RSVP.Promise(function (resolve, reject) {
      // make the dev locale directory
      mkdirp(self.devLocalePath(root), self.resolveOrReject(resolve, reject));
    }).then(function () {
        // grab common files
        self.grabCommonFiles(root, true);
      }).then(function () {
        // grab each specific locale files
        var locales = self.listProjectLocales(root, config);
        return RSVP.all(locales.map(function (locale) {
          return self.grabLocalizedFiles(locale, root, true);
        }));
      });
  },

  /**
   * Grab localized files for the given locale
   *
   * @param {string|Locale} locale
   * @param {string} root
   * @param {boolean} [onlyIfMissing=false]
   * @return {Promise}
   */
  grabLocalizedFiles: function (locale, root, onlyIfMissing) {
    var files = self.FILES.LOCALIZED, all = [], vars;
    root = self.i18nPath(root, '' + locale);
    if ('' + locale === self.DEV_LOCALE) {
      vars = {locale: 'en'};
    }
    else {
      vars = {locales: '' + locale};
    }
    for (var key in files) {
      all.push(files[key].download(onlyIfMissing, vars, root));
    }
    return RSVP.all(all).then(function () {
      return files;
    });
  },

  /**
   * Grab all the common files
   *
   * @param {string} root
   * @param {boolean} [onlyIfMissing=false]
   * @return {Promise}
   */
  grabCommonFiles: function (root, onlyIfMissing) {
    var files = self.FILES.COMMON, all = [];
    root = self.i18nPath(root);
    for (var key in files) {
      all.push(files[key].download(onlyIfMissing, null, root));
    }
    return RSVP.all(all).then(function () {
      return files;
    });
  },


  updateDataFiles: function () {
    var root = self.SELF_DATA_PATH;
    return self.grabCommonFiles(root, false)
      .then(function () {
        return self.FILES.COMMON.LOCALES.clone({
          root:    root,
          path:    'locales.json',
          prepend: null,
          append:  null
        }).download();
      })
      .then(function () {
        return RSVP.all(self.allKnownLocales().map(function (locale) {
          return self.grabLocalizedFiles(locale, root);
        }));
      })
      .then(function (results) {
        console.log('[i18n] Downloaded ' + results.length + ' files.');
      });
  },

  /**
   * Get all the known locales
   *
   * @return {Array.<string>}
   */
  allKnownLocales: function () {
    return require(sysPath.join(self.SELF_DATA_PATH, 'locales.json'));
  },


  /**
   * Downloads a file to the given path
   *
   * @param {{url: string, path: string, prepend: string, append: string}} desc
   * @param {boolean} [onlyIfMissing=false]
   * @return {Promise}
   */
  download: function (desc, onlyIfMissing) {
    if (onlyIfMissing && fs.existsSync(desc.path)) {
      return RSVP.resolve();
    }
    return new RSVP.Promise(function (resolve, reject) {
      mkdirp(sysPath.dirname(desc.path), function (err) {
        var file;
        if (err) {
          reject(err);
        }
        else {
          http.get(desc.url, function (res) {
            file = fs.createWriteStream(desc.path);
            if (desc.prepend) {
              file.write(desc.prepend);
            }
            res.pipe(file);
            file.on('finish', function () {
              file.close(function (err) {
                if (err) {
                  reject(err);
                }
                else if (desc.append) {
                  fs.appendFile(desc.path, desc.append, self.resolveOrReject(resolve, reject));
                }
                else {
                  resolve();
                }
              });
            });
          }).on('error', function (err) {
            reject(err);
          });
        }
      });
    }).then(function () {
        console.log('[i18n] Successfully downloaded ' + desc.url);
      });
  }
};
