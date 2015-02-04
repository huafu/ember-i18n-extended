import Ember from 'ember';
import ENV from '../../config/environment';

var map = Ember.EnumerableUtils.map;
var forEach = Ember.EnumerableUtils.forEach;
var slice = Array.prototype.slice;
var fmt = Ember.String.fmt;

var SPLITTER = /(^|[^\{])\{([^}]*)}/g;
var PARSER = /^(?:\$([0-9]+)|([a-z][a-zA-Z0-9]*):(.+)|((?:\/|\.\/|\.\.\/).+))$/;
var PARAMS_SPLITTER = /(^|[^\\]),/g;
var PARAM_PARSER = /^(?:\$([0-9]*)|(.*))$/;

var STRING_REPLACE = /\{\{/g;
var PARAM_REPLACE = /\\,/g;

var RETURN_EMPTY_STRING_FUNCTION = function () {
  return '';
};

var COMPILE_CACHE = Object.create(null);


function createReturnThatFunction(that) {
  return function () {
    return that;
  };
}

/**
 * Create a bundle for use with translate
 * @param {I18nCompiledKey} compiledKey
 * @param {Object} dependencies
 * @param {I18nTreeKeyNode} node
 * @return {Function}
 */
function createI18nBundle(compiledKey, dependencies, node) {
  var key = node.get('nodeFullPath');
  var bundle = function () {
    var args = slice.call(arguments);
    if (dependencies) {
      args.push(dependencies);
    }
    return compiledKey.method.apply(this, args);
  };
  bundle.toString = function () {
    return key;
  };
  bundle.isI18nBundle = true;
  bundle.compiledKey = compiledKey;
  return bundle;
}


/**
 * Contains a compiled key, not attached to any node
 *
 * @param {string} source
 * @param {Function} method
 * @param {Array.<string>} [dependencyPaths=[]]
 * @constructor
 */
function I18nCompiledKey(source, method, dependencyPaths) {
  this.method = method;
  this.source = source;
  this.dependencies = dependencyPaths || [];
}

/**
 * Resolve dependencies of this compiled key and create a bundle
 * @param {I18nTreeKeyNode} node
 * @return {Promise}
 */
I18nCompiledKey.prototype.bundleFor = function (node) {
  var paths = this.dependencies, _this = this;
  return Ember.RSVP.all(map(paths, function (path) {
    return node.resolvePath(path);
  }))
    .then(function (dependencyNodes) {
      var dependencies;
      if (dependencyNodes.length) {
        dependencies = Object.create(null);
        forEach(dependencyNodes, function (node, index) {
          dependencies[paths[index]] = node.get('nodeValue');
        });
      }
      return createI18nBundle(_this, dependencies, node);
    });
};


/**
 * Unescape a string coming from the source
 * @param {string} str
 * @return {string}
 */
function unescapeString(str) {
  return str.replace(STRING_REPLACE, '{');
}

/**
 * Unescape a parameter value from a helper call
 * @param {string} param
 * @return {string}
 */
function unescapeParam(param) {
  return param.replace(PARAM_REPLACE, ',');
}


/**
 * @class ArgumentsDescriptor
 * @property {number} index
 * @property {number} count
 */

/**
 * Register a parameter in the given arguments descriptor
 * @param {ArgumentsDescriptor} args
 * @param {number} [index]
 * @return {string}
 */
function compileArgument(args, index) {
  if (index == null) {
    index = ++args.index;
  }
  else {
    index = parseInt(index);
  }
  args.count = Math.max(index, args.count);
  return '_(a[' + (index - 1) + '])';
}

/**
 * Compile a helper call
 * @param {string} name
 * @param {string} paramsString
 * @param {ArgumentsDescriptor} args
 * @return {string}
 */
function compileHelperCall(name, paramsString, args) {
  var stream, parts, param, match;
  stream = [];
  parts = paramsString.split(PARAMS_SPLITTER);
  while (parts.length) {
    param = unescapeParam(parts.shift() + (parts.length ? parts.shift() : ''));
    PARAM_PARSER.lastIndex = 0;
    match = param.match(PARAM_PARSER);
    if (match[1] != null) {
      // it's a parameter
      if (match[1]) {
        // it's an indexed parameter
        stream.push(compileArgument(args, match[1]));
      }
      else {
        // it's the next parameter
        stream.push(compileArgument(args));
      }
    }
    else {
      stream.push(JSON.stringify(match[2]));
    }
  }
  return '_(this.' + name + '(' + stream.join(',') + '))';
}

/**
 * Compile a list of tokens
 * @param {Array.<string>} tokens
 * @param {Array.<string>} dependencyPaths
 * @param {Object} helpers
 * @return {*}
 */
function compileTokens(tokens, dependencyPaths, helpers) {
  var match, str, args, helperName, helperParams, localSource, isStatic, pipe;
  pipe = [];
  isStatic = true;
  args = Object.create(null);
  args.index = 0;
  args.count = 0;
  while (tokens.length) {
    if (isStatic) {
      // it is a static string
      str = unescapeString(tokens.shift() + (tokens.length ? tokens.shift() : ''));
      if (str) {
        pipe.push(JSON.stringify(str));
      }
    }
    else {
      // it is a {...} block
      str = tokens.shift();
      if (str === '') {
        // it's the next parameter
        pipe.push(compileArgument(args));
      }
      else {
        // it's a dynamic value
        PARSER.lastIndex = 0;
        match = str.match(PARSER);
        if (!match) {
          throw new Error(fmt(
            'wrong data between `{` and `}`, if you need to output `{`, double it (given: `%@`)',
            str
          ));
        }
        if (match[1]) {
          // it's a parameter number
          pipe.push(compileArgument(args, match[1]));
        }
        else if (match[2]) {
          // it is a helper call
          helperName = match[2];
          helperParams = match[3];
          if (!helpers[helperName]) {
            return new Error(fmt(
              'unknown i18n helper `%@` in `%@`',
              helperName, str
            ));
          }
          pipe.push(compileHelperCall(helperName, helperParams, args));
        }
        else if (match[4]) {
          // it is a link to another translation
          str = match[4];
          dependencyPaths.push(str);
          pipe.push('_(k(' + JSON.stringify(str) + '))');
        }
      }
    }
    isStatic = !isStatic;
  }
  // build the function if it is a function
  if (pipe.length) {
    localSource = 'var a=[].slice.call(arguments),_=function(d){return d==null?"":d;};';
    if (dependencyPaths.length) {
      localSource += 'var d=a.pop(), k=function(k){return d[k].apply(this,a);};';
    }
    localSource += 'return ' + pipe.join('+') + ';';
    if (ENV.LOG_I18N_COMPILATIONS) {
      Ember.debug(fmt(
        '[i18n] Compiled i18n: `%@`.',
        localSource
      ));
    }
    localSource = new Function(localSource);
  }
  else {
    // just return an empty string
    localSource = RETURN_EMPTY_STRING_FUNCTION;
  }
  return localSource;
}


// ************************************************************************************************
// ***************| Here comes our main function |*************************************************
// ************************************************************************************************

/**
 * Compile a translation string/function
 * @param {string|Function} source
 * @param {Object} helpers
 */
export default function (source, helpers) {
  var compiled, cacheKey, dependencyPaths, parts;

  // just return the compiled version if it is a bundle
  if (source && source.isI18nBundle) {
    return source.compiledKey;
  }

  // if it is a function, it can't be cached
  if (typeof source === 'function') {
    return new I18nCompiledKey(source.toString(), source);
  }

  // if it is not a string there is an error
  if (typeof source !== 'string') {
    throw new Error('given source must be a `string` or a `function`');
  }

  // try to get it from our cache
  cacheKey = source;
  compiled = COMPILE_CACHE[cacheKey];

  if (!compiled) {
    // compile if not in cache
    dependencyPaths = [];
    parts = source.split(SPLITTER);
    if (parts.length === 1) {
      // return just the string if it is static
      compiled = createReturnThatFunction(unescapeString(parts[0]));
    }
    else {
      // else compile all the tokens
      compiled = compileTokens(parts, dependencyPaths, helpers);
    }
    // save it in cache
    COMPILE_CACHE[cacheKey] = compiled = new I18nCompiledKey(source, compiled, dependencyPaths);
  } // if not compiled
  return compiled;
}

