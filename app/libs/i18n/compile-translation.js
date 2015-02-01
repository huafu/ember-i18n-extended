import Ember from 'ember';
import computed from './computed';
import translatePath from './translate-path';

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

function addParam(params, index) {
  if (parseInt(index) > params.length) {
    params.push('p' + (params.length + 1));
  }
}

function pipeHelper(helperName, helperParams, pipe, params, paramIndex) {
  var selfPipe = [], parts = helperParams.split(PARAMS_SPLITTER), param, match;

  while (parts.length) {
    param = unescapeParam(parts.shift() + parts.length ? parts.shift() : '');
    match = param.match(PARAM_PARSER);
    if (match[1] !== null) {
      // it's a parameter
      if (match[1]) {
        // it's an indexed parameter
        selfPipe.push('p' + match[1]);
        addParam(params, match[1]);
      }
      else {
        // it's the next parameter
        selfPipe.push('p' + (++paramIndex));
        addParam(params, paramIndex);
      }
    }
    else {
      selfPipe.push(JSON.stringify(match[2]));
    }
  }

  pipe.push(helperName + '(' + selfPipe.join(',') + ')');
  return paramIndex;
}

function makeDynamic(node, deps, method) {
  var keys = map(deps, function (key) {
    return 'node.' + key;
  });
  return Ember.Object.extend({
    i18nDynamic: true,

    translateFunction: computed.ro.apply(
      null, keys.concat(['method', function () {
        return function () {
          var args = slice.call(arguments);
          args.push(this.getProperties(keys));
          return this.get('method').apply(this, args);
        };
      }])
    )
  }).create({node: node, method: method});
}

export default function (node, key, value) {
  var isStatic, pipe, helpers, parts, match, str, params, keys,
    paramIndex, helperName, helperParams, otherKeys, source;
  helpers = node.get('nodeLocale.service.helpers');
  parts = value.split(SPLITTER);
  if (parts.length === 1) {
    // return just the string if it is static
    return unescapeString(parts[0]);
  }
  pipe = [];
  isStatic = true;
  otherKeys = [];
  paramIndex = 0;
  params = [];
  while (parts.length) {
    if (isStatic) {
      str = unescapeString(parts.shift() + parts.length ? parts.shift() : '');
      if (str) {
        pipe.push(JSON.stringify(str));
      }
    }
    else {
      str = parts.shift();
      if (str === '') {
        // it's the next parameter
        pipe.push('p' + (++paramIndex));
        addParam(params, paramIndex);
      }
      else {
        // it's a dynamic value
        match = str.match(PARSER);
        if (!match) {
          return new Error('wrong data between `{` and `}`, if you need to output `{`, double it (given: `' + str + '`)');
        }
        if (match[1]) {
          // it's a parameter number
          pipe.push('p' + match[1]);
          addParam(params, match[1]);
        }
        else if (match[2]) {
          // it is a helper call
          helperName = match[2];
          helperParams = match[3];
          if (!helpers[helperName]) {
            return new Error('unknown i18n helper `' + helperName + '` in `' + str + '`');
          }
          paramIndex = pipeHelper(helperName, helperParams, pipe, params, paramIndex);
          if (paramIndex instanceof Error) {
            paramIndex.message += ' in `' + str + '`';
            return paramIndex;
          }
        }
        else if (match[4]) {
          // it is a link to another translation
          str = translatePath(match[4]);
          if (!str) {
            return new Error('wrong linked key: `' + match[4] + '`');
          }
          otherKeys.push(str);
          pipe.push('k.' + str);
        }
      }
    }
    isStatic = !isStatic;
  }
  // build the function if it is a function
  if (pipe.length) {
    source = 'return ' + pipe.join('+') + ';';
    if (otherKeys.length) {
      source = 'var k=arguments[arguments.length-1];' + source;
    }
    if (params.length) {
      source = new Function(params.join(','), source);
    }
    else {
      source = new Function(source);
    }
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
