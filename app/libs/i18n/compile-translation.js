import Ember from 'ember';
import computed from './computed';
import translatePath from './translate-path';
import ENV from '../../config/environment';

var map = Ember.EnumerableUtils.map;
var slice = Array.prototype.slice;

var SPLITTER = /(^|[^\{])\{([^}]*)}/g;
var PARSER = /^(?:\$([0-9]+)|([a-z][a-zA-Z0-9]*):(.+)|((?:\/|\.\/|\.\.\/).+))$/;
var PARAMS_SPLITTER = /(^|[^\\],)/g;
var PARAM_PARSER = /^(?:\$([0-9]*)|(.*))$/;

var STRING_REPLACE = /\{\{/g;
var PARAM_REPLACE = /\\,/g;

function unescapeString(str) {
  return str.replace(STRING_REPLACE, '{');
}

function unescapeParam(param) {
  return param.replace(PARAM_REPLACE, ',');
}

function addParam(args, index) {
  if (index == null) {
    index = ++args.index;
  }
  else {
    index = parseInt(index);
  }
  args.count = Math.max(index, args.count);
  return 'a[' + (index - 1) + ']';
}

function pipeHelper(name, params, args) {
  var selfPipe = [], parts = params.split(PARAMS_SPLITTER), param, match;

  while (parts.length) {
    param = unescapeParam(parts.shift() + (parts.length ? parts.shift() : ''));
    match = param.match(PARAM_PARSER);
    if (match[1] !== null) {
      // it's a parameter
      if (match[1]) {
        // it's an indexed parameter
        selfPipe.push(addParam(args, match[1]));
      }
      else {
        // it's the next parameter
        selfPipe.push(addParam(args));
      }
    }
    else {
      selfPipe.push(JSON.stringify(match[2]));
    }
  }
  return name + '(' + selfPipe.join(',') + ')';
}

function makeDynamic(node, deps, method) {
  var keys = map(deps, function (key) {
    return 'node.' + key;
  });
  return Ember.Object.extend({
    i18nDynamic: true,

    translateFunction: computed.ro.apply(
      null, keys.concat(['method', function () {
        var k = this.get('node').getProperties(deps), m = this.get('method');
        return function () {
          var args = slice.call(arguments);
          args.push(k);
          return m.apply(this, args);
        };
      }])
    )
  }).create({node: node, method: method});
}

export default function (node, key, value) {
  var isStatic, pipe, helpers, parts, match, str, args,
    helperName, helperParams, otherKeys, source;
  helpers = node.get('nodeLocale.service.helpers');
  parts = value.split(SPLITTER);
  if (parts.length === 1) {
    // return just the string if it is static
    return unescapeString(parts[0]);
  }
  pipe = [];
  isStatic = true;
  otherKeys = [];
  args = Object.create(null);
  args.index = 0;
  args.count = 0;
  while (parts.length) {
    if (isStatic) {
      str = unescapeString(parts.shift() + (parts.length ? parts.shift() : ''));
      if (str) {
        pipe.push(JSON.stringify(str));
      }
    }
    else {
      str = parts.shift();
      if (str === '') {
        // it's the next parameter
        pipe.push(addParam(args));
      }
      else {
        // it's a dynamic value
        match = str.match(PARSER);
        if (!match) {
          return new Error('wrong data between `{` and `}`, if you need to output `{`, double it (given: `' + str + '`)');
        }
        if (match[1]) {
          // it's a parameter number
          pipe.push(addParam(args, match[1]));
        }
        else if (match[2]) {
          // it is a helper call
          helperName = match[2];
          helperParams = match[3];
          if (!helpers[helperName]) {
            return new Error('unknown i18n helper `' + helperName + '` in `' + str + '`');
          }
          source = pipeHelper(helperName, helperParams, args);
          if (source instanceof Error) {
            source.message += ' in `' + str + '`';
            return str;
          }
          pipe.push(source);
        }
        else if (match[4]) {
          // it is a link to another translation
          str = translatePath(match[4]);
          if (!str) {
            return new Error('wrong linked key: `' + match[4] + '`');
          }
          otherKeys.push(str);
          pipe.push('k(' + JSON.stringify(str) + ')');
        }
      }
    }
    isStatic = !isStatic;
  }
  // build the function if it is a function
  if (pipe.length) {
    source = 'var a=[].slice.call(arguments);';
    if (otherKeys.length) {
      source += 'var p=' + (ENV.environment === 'production') ? '1' : '0';
      source += ',d=a.pop();var k=function(k){var s=d[k],t=typeof s;return t==="string"?s:(t==="function"?s.apply(this,a):(p?"?":k));};';
    }
    source += 'return ' + pipe.join('+') + ';';
    if (ENV.LOG_I18N_COMPILATIONS) {
      Ember.debug('[i18n] Compiled key `' + node.get('nodePath') + '.' + key + '`: ' + source);
    }
    source = new Function(source);
    if (otherKeys.length) {
      source = makeDynamic(node, otherKeys, source);
    }
    return source;
  }
  else {
    // just return an empty string
    return '';
  }
}
