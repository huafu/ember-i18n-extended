var CACHE = Object.create(null);
var TESTER = /^[a-z0-9\$_]+$/;
var hasOwn = Object.prototype.hasOwnProperty;

export default function (key) {
  if (hasOwn.call(CACHE, key)) {
    return CACHE[key];
  }
  return CACHE[key] = TESTER.test(key);
}
