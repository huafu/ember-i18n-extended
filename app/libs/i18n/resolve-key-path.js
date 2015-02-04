var PARENT_REPLACER = /^(?:\.\.\/)+/;

function opt(optionValue, defaultValue) {
  return typeof optionValue === 'string' ? optionValue : defaultValue;
}

/**
 * Resolve a path
 *
 * @param {string} path
 * @param {{[root]: boolean|string, [dot]: boolean, [parent]: boolean|string, [ref]: string}} options
 * @return {{resolved: boolean, root: boolean, dot: boolean, parent: boolean, ref: boolean, path: string}}
 */
function resolveKeyPath(path, options) {
  var option, res = Object.create(null);
  if (typeof path !== 'string') {
    throw new Error('[i18n] Trying to resolve path `' + path + '`which is not a string.');
  }
  if (options.root && path.charAt(0) === '/') {
    res.root = true;
    path = opt(options.root, 'rootNode') + '.' + path.substr(1);
  }
  else if (options.dot && path.substr(0, 2) === './') {
    res.dot = true;
    path = path.substr(2);
  }
  else if (options.parent && path.substr(0, 3) === '../') {
    res.parent = true;
    option = opt(options.parent, 'parentNode');
    PARENT_REPLACER.lastIndex = 0;
    path = path.replace(PARENT_REPLACER, function (dummy, str) {
      var count = str.length / 3;
      str = '';
      while (count-- > 0) {
        str += option + '.';
      }
      return str;
    });
  }
  else if (options.ref && path.substr(0, 3) === '/&.') {
    res.ref = true;
    path = options.ref + '.' + path.substr(3);
  }
  res.resolved = res.root || res.parent || res.dot || res.ref || false;
  res.path = path;
  return res;
}

export default resolveKeyPath
