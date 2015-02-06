var RSVP = require('rsvp');
var mkdirp = require('mkdirp');
var http = require('http');
var sysPath = require('path');
var fs = require('fs');
var escodegen = require('escodegen');
var acorn = require('acorn');

var self;

var CODE_GEN_OPTIONS = {
  format:  {
    indent: {
      style: '  '
      //base: 0,
      //adjustMultilineComment: false
    },
    //newline: '\n',
    //space: ' ',
    //json: false,
    //renumber: false,
    //hexadecimal: false,
    quotes: 'double'
    //escapeless: false,
    //compact: false,
    //parentheses: true,
    //semicolons: true,
    //safeConcatenation: false
  },
  moz:     {
    //starlessGenerator: false,
    //parenthesizedComprehensionBlock: false,
    //comprehensionExpressionStartsWithAssignment: false
  },
  //parse: null,
  comment: true
  //sourceMap: undefined,
  //sourceMapRoot: null,
  //sourceMapWithCode: false,
  //file: undefined,
  //sourceContent: originalSource,
  //directive: false,
  //verbatim: undefined
};


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
      return part.toString().replace(/\//g, sysPath.sep);
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
   * @param {string|Locale} [locale]
   * @return {string}
   */
  i18nPath: function (root, locale) {
    return self.normalizePath(root, self.I18N_DIR, locale);
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
   * Is the given locale a valid one?
   *
   * @method isValidLocale
   * @param {string|Locale} locale
   * @return {boolean}
   */
  isValidLocale: function (locale) {
    locale = '' + locale;
    return locale === self.DEV_LOCALE || self.allKnownLocales().indexOf(locale) !== -1;
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
    var locales, included, warn, args;
    locales = [];
    included = {};
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
          if (self.isValidLocale(strLocale)) {
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
  },


  /**
   * Parse configuration given an EmberApp
   * @method parseConfig
   * @param {EmberApp|EmberAddon} app
   * @return Config
   */
  parseConfig: function (app) {
    var conf = app.project.config(app.env), i18nConf, l10nConf, resConf, defaultLocale;
    defaultLocale = (app.env === 'development' || app.env === 'test') ? self.DEV_LOCALE : 'en';
    resConf = {
      i18n: i18nConf = conf.i18n || {},
      l10n: l10nConf = conf.l10n || {}
    };
    // by default include the native language list
    if (!i18nConf.hasOwnProperty('includeNativeLanguages')) {
      i18nConf.includeNativeLanguages = true;
    }
    i18nConf.path = self.I18N_DIR;
    if (!i18nConf.defaultLocale) {
      i18nConf.defaultLocale = defaultLocale;
    }
    if (!i18nConf.fallbackLocale) {
      i18nConf.fallbackLocale = i18nConf.defaultLocale;
    }
    if (!i18nConf.defaultDateFormat) {
      i18nConf.defaultDateFormat = 'MEDIUM';
    }
    if (!i18nConf.commonContextName) {
      i18nConf.commonContextName = 'common';
    }
    if (!i18nConf.enabledLocales) {
      i18nConf.enabledLocales = self.listProjectLocales(app.project.root, null, false, true);
    }
    if (i18nConf.enabledLocales.indexOf(i18nConf.defaultLocale) === -1) {
      i18nConf.enabledLocales.push(i18nConf.defaultLocale);
    }
    if (i18nConf.enabledLocales.indexOf(i18nConf.fallbackLocale) === -1) {
      i18nConf.enabledLocales.push(i18nConf.fallbackLocale);
    }
    if ((app.env === 'development' || app.env === 'test') && i18nConf.enabledLocales.indexOf(self.DEV_LOCALE) === -1) {
      i18nConf.enabledLocales.unshift(self.DEV_LOCALE);
    }
    // filter and warn about wrong ones
    i18nConf.enabledLocales = self.filterLocales(i18nConf.enabledLocales, true);
    // if the bundled is not set, set the default locale as bundled
    if (!i18nConf.bundledLocales) {
      i18nConf.bundledLocales = [i18nConf.defaultLocale];
    }
    else {
      i18nConf.bundledLocales = i18nConf.bundledLocales.filter(function (locale) {
        var res = i18nConf.enabledLocales.indexOf(locale) !== -1;
        if (!res) {
          console.warn(
            '[i18n] Locale `' + locale +
            '` has been removed from the bundled locales since it is not in the list of enabled locales.'
          );
        }
        return res;
      });
    }
    return resConf;
  },

  /**
   * Parse an es6 file
   *
   * @method parseJsFile
   * @param {string} file
   * @param {string} fallbackSource
   * @return {AST}
   */
  parseJsFile: function (file, fallbackSource) {
    var comments = [], tokens = [], ast, source, isFallback;
    if (fallbackSource != null && !fs.existsSync(file)) {
      isFallback = true;
      source = fallbackSource;
    }
    else {
      source = fs.readFileSync(file, {encoding: 'utf8'});
    }
    ast = acorn.parse(source, {
      // collect ranges for each node
      ranges:      true,
      // collect comments in Esprima's format
      onComment:   comments,
      // collect token ranges
      onToken:     tokens,
      // ECMAScript version
      ecmaVersion: 6
    });
    // attach comments using collected information
    escodegen.attachComments(ast, comments, tokens);

    // define our save property
    Object.defineProperty(ast, 'save', {
      value: function () {
        var code = self.astToJs(this);
        if (isFallback) {
          mkdirp.sync(sysPath.dirname(file));
        }
        return fs.writeFileSync(file, code);
      }
    });

    //return the ast
    return ast;
  },

  /**
   * Generate JS from given ast node
   *
   * @method astToJs
   * @param {Object} node
   * @return {string}
   */
  astToJs: function (node) {
    return escodegen.generate(node, CODE_GEN_OPTIONS);
  },


  /**
   * Cleanup a part of a key path (from context to key)
   *
   * @method cleanupKeySegment
   * @param {string} segment
   * @return {string}
   */
  cleanupKeySegment: function (segment) {
    return segment.replace(/([A-Z]+)([^A-Z]|$)/g, function (dummy, str, after) {
      return str.toLowerCase() + (after ? '_' + after : '');
    }).replace(/[_\/\.-]+/g, '_');
  },

  /**
   * Cleanup a path
   *
   * @method cleanupKeyFullPath
   * @param {string} path
   * @return {string}
   */
  cleanupKeyFullPath: function (path) {
    return path.split('.').map(self.cleanupKeySegment).join('.');
  },


  /**
   * Returns the context for a given path
   *
   * @method contextForPath
   * @param {string} path
   * @return {string}
   */
  contextForPath: function (path) {
    return path.split('.').shift();
  },

  /**
   * Get the full path to a context file in given locale and root folder
   *
   * @method filePathForContext
   * @param {string} root
   * @param {string} locale
   * @param {string} context
   * @return {string}
   */
  filePathForContext: function (root, locale, context) {
    return sysPath.join(self.i18nPath(root, locale), context + '.js');
  },

  /**
   * Find the first item in the array where the iterator would return true
   *
   * @method find
   * @param {Array} array
   * @param {Function} iterator
   * @return {*}
   */
  find: function (array, iterator) {
    for (var i = 0, count = array.length; i < count; i++) {
      if (iterator(array[i], i, array)) {
        return array[i];
      }
    }
  },

  /**
   * Finds the first item in an array where a property with given name is truthy,
   * or is equals to given value
   *
   * @method findBy
   * @param {Array} array
   * @param {string} key
   * @param {*} [value]
   * @return {*}
   */
  findBy: function (array, key, value) {
    return self.find(array, function (item) {
      if (item) {
        if (value) {
          if (item[key] === value) {
            return true;
          }
        }
        else if (item[key]) {
          return true;
        }
      }
    });
  },

  /**
   * Invoke a method on each items in the given array
   *
   * @method invoke
   * @param {Array} array
   * @param {string} methodName
   * @return {Array}
   */
  invoke: function (array, methodName) {
    var args = [].slice.call(arguments, 2);
    return array.map(function (item) {
      item[methodName].apply(item, args);
    });
  },


  /**
   * Create an AST node for the given data
   *
   * @method astNodeFor
   * @param {*} data
   * @return {Object}
   */
  astNodeFor: function (data) {
    var node = acorn.parse('export default ' + JSON.stringify(data, null, '  ') + ';', {ecmaVersion: 6});
    return node.body[0].declaration;
  }

};
