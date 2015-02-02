var PARSER = /^(\/(?:&\.)?|\.\/|(?:\.\.\/)+)([^\.].*)$/;
var PARENT_REPLACER = /\.\.\//g;

var CACHE = Object.create(null);
var hasOwn = Object.prototype.hasOwnProperty;

export default function (path) {
  var matches, parts, res;
  if (hasOwn.call(CACHE, path)) {
    return CACHE[path];
  }
  else {
    PARSER.lastIndex = 0;
    matches = path.match(PARSER);
    if (matches) {
      if (matches[1] === '/') {
        parts = matches[2].split('.');
        res = ['nodeLocale.contexts.' + parts.shift() + '.keys'].concat(parts).join('.');
      }
      else if (matches[1] === '/&.') {
        res = 'nodeContext.keys.' + matches[2];
      }
      else if (matches[1] === './') {
        res = matches[2];
      }
      else {
        res = matches[1].replace(PARENT_REPLACER, 'parentNode.') + matches[2];
      }
    }
    return CACHE[path] = res;
  }
}
